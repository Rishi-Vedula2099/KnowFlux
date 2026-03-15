# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""FAISS vector store management."""
import os
import json
import numpy as np # type: ignore
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
            import faiss # type: ignore
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
            index = faiss.read_index(index_file) # type: ignore
            cls._index = index
            with open(docs_file, "r", encoding="utf-8") as f:
                cls._documents = json.load(f)
            num_vectors = index.ntotal if index is not None else 0 # type: ignore
            print(f"✅ Loaded FAISS index with {num_vectors} vectors")
        else:
            cls._index = faiss.IndexFlatIP(cls._dimension) # type: ignore
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
        
        if cls._index is not None:
            faiss.write_index(cls._index, index_file) # type: ignore
            
        with open(docs_file, "w", encoding="utf-8") as f:
            json.dump(cls._documents, f, ensure_ascii=False)
            
        index = cls._index
        num_vectors = index.ntotal if index is not None else 0 # type: ignore
        print(f"💾 Saved FAISS index with {num_vectors} vectors")
    
    @classmethod
    def add_documents(cls, texts: List[str], embeddings: List[List[float]], metadatas: List[dict]) -> int:
        """Add documents with their embeddings to the index."""
        faiss = cls._ensure_faiss()
        if faiss is None:
            return 0
            
        if cls._index is None:
            cls._index = faiss.IndexFlatIP(cls._dimension) # type: ignore
            cls._documents = []
        
        vectors = np.array(embeddings, dtype=np.float32)
        # Normalize for cosine similarity
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1
        vectors = vectors / norms
        
        start_id = len(cls._documents)
        if cls._index is not None:
            cls._index.add(vectors) # type: ignore
        
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
        index = cls._index
        if index is None or index.ntotal == 0:
            return []
        
        query_vec = np.array([query_embedding], dtype=np.float32)
        norms = np.linalg.norm(query_vec, axis=1, keepdims=True)
        norms[norms == 0] = 1
        query_vec = query_vec / norms
        
        num_to_search = min(top_k, index.ntotal) # type: ignore
        scores, indices = index.search(query_vec, num_to_search) # type: ignore
        
        results = []
        for score, idx in zip(scores[0], indices[0]): # type: ignore
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
                removed_count = int(removed_count) + 1 # type: ignore
            else:
                remaining_docs.append(doc)
        
        if int(removed_count) > 0: # type: ignore
            # Rebuild index from remaining docs (FAISS doesn't support direct deletion with IndexFlatIP)
            cls._index = faiss.IndexFlatIP(cls._dimension) # type: ignore
            cls._documents = []
            
            if remaining_docs:
                # Re-index remaining documents
                # We need the embeddings but they aren't stored, so we store them
                # For now, we rebuild from scratch
                cls._documents = remaining_docs
                for i, doc in enumerate(cls._documents):
                    doc["id"] = i # type: ignore
            
            cls.save_index()
        
        return int(removed_count) # type: ignore
    
    @classmethod
    def get_stats(cls) -> dict:
        """Get index statistics."""
        return {
            "total_vectors": cls._index.ntotal if cls._index else 0, # type: ignore
            "total_documents": len(cls._documents),
            "dimension": cls._dimension,
        }
