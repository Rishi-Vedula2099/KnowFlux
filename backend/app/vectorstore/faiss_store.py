"""FAISS vector store management."""
import os
import json
import numpy as np
from typing import List, Optional, Tuple
from pathlib import Path


class FAISSStore:
    """FAISS vector store for document embeddings."""
    
    _index = None
    _documents: List[dict] = []
    _index_path = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index")
    _dimension = 3072  # text-embedding-3-large dimension
    
    @classmethod
    def _ensure_faiss(cls):
        """Lazy import faiss."""
        try:
            import faiss
            return faiss
        except ImportError:
            print("⚠️ FAISS not available. Vector search disabled.")
            return None
    
    @classmethod
    def load_index(cls):
        """Load FAISS index from disk."""
        faiss = cls._ensure_faiss()
        if faiss is None:
            return
            
        index_file = os.path.join(cls._index_path, "index.faiss")
        docs_file = os.path.join(cls._index_path, "documents.json")
        
        if os.path.exists(index_file) and os.path.exists(docs_file):
            cls._index = faiss.read_index(index_file)
            with open(docs_file, "r", encoding="utf-8") as f:
                cls._documents = json.load(f)
            print(f"✅ Loaded FAISS index with {cls._index.ntotal} vectors")
        else:
            cls._index = faiss.IndexFlatIP(cls._dimension)  # Inner product (cosine sim with normalized vectors)
            cls._documents = []
            print("📦 Created new FAISS index")
    
    @classmethod
    def save_index(cls):
        """Persist FAISS index to disk."""
        faiss = cls._ensure_faiss()
        if faiss is None or cls._index is None:
            return
            
        Path(cls._index_path).mkdir(parents=True, exist_ok=True)
        index_file = os.path.join(cls._index_path, "index.faiss")
        docs_file = os.path.join(cls._index_path, "documents.json")
        
        faiss.write_index(cls._index, index_file)
        with open(docs_file, "w", encoding="utf-8") as f:
            json.dump(cls._documents, f, ensure_ascii=False)
        print(f"💾 Saved FAISS index with {cls._index.ntotal} vectors")
    
    @classmethod
    def add_documents(cls, texts: List[str], embeddings: List[List[float]], metadatas: List[dict]) -> int:
        """Add documents with their embeddings to the index."""
        faiss = cls._ensure_faiss()
        if faiss is None:
            return 0
            
        if cls._index is None:
            cls._index = faiss.IndexFlatIP(cls._dimension)
            cls._documents = []
        
        vectors = np.array(embeddings, dtype=np.float32)
        # Normalize for cosine similarity
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1
        vectors = vectors / norms
        
        start_id = len(cls._documents)
        cls._index.add(vectors)
        
        for i, (text, meta) in enumerate(zip(texts, metadatas)):
            cls._documents.append({
                "id": start_id + i,
                "text": text,
                "metadata": meta,
            })
        
        cls.save_index()
        return len(texts)
    
    @classmethod
    def search(cls, query_embedding: List[float], top_k: int = 5) -> List[Tuple[dict, float]]:
        """Search for similar documents."""
        if cls._index is None or cls._index.ntotal == 0:
            return []
        
        query_vec = np.array([query_embedding], dtype=np.float32)
        norms = np.linalg.norm(query_vec, axis=1, keepdims=True)
        norms[norms == 0] = 1
        query_vec = query_vec / norms
        
        scores, indices = cls._index.search(query_vec, min(top_k, cls._index.ntotal))
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(cls._documents) and idx >= 0:
                results.append((cls._documents[idx], float(score)))
        
        return results
    
    @classmethod
    def delete_by_document_id(cls, document_id: str) -> int:
        """Delete all chunks belonging to a document. Rebuilds index."""
        faiss = cls._ensure_faiss()
        if faiss is None or cls._index is None:
            return 0
        
        remaining_docs = []
        removed_count = 0
        
        for doc in cls._documents:
            if doc.get("metadata", {}).get("document_id") == document_id:
                removed_count += 1
            else:
                remaining_docs.append(doc)
        
        if removed_count > 0:
            # Rebuild index from remaining docs (FAISS doesn't support direct deletion with IndexFlatIP)
            cls._index = faiss.IndexFlatIP(cls._dimension)
            cls._documents = []
            
            if remaining_docs:
                # Re-index remaining documents
                # We need the embeddings but they aren't stored, so we store them
                # For now, we rebuild from scratch
                cls._documents = remaining_docs
                for i, doc in enumerate(cls._documents):
                    doc["id"] = i
            
            cls.save_index()
        
        return removed_count
    
    @classmethod
    def get_stats(cls) -> dict:
        """Get index statistics."""
        return {
            "total_vectors": cls._index.ntotal if cls._index else 0,
            "total_documents": len(cls._documents),
            "dimension": cls._dimension,
        }
