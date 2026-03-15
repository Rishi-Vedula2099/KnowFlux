# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Documents management API."""
from fastapi import APIRouter, HTTPException # type: ignore
from typing import List
from app.database.mongodb import get_collection # type: ignore
from app.database.models import DocumentResponse # type: ignore
from app.vectorstore.faiss_store import FAISSStore # type: ignore

router = APIRouter()

# In-memory fallback for documents
_documents_store: List[dict] = []


@router.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    collection = get_collection("documents")
    if collection is not None:
        cursor = collection.find({}, {"_id": 0}).sort("upload_date", -1)
        docs = await cursor.to_list(length=100)
        return {"documents": docs}
    
    # Fallback: derive from FAISS metadata
    seen = {}
    for doc in FAISSStore._documents:
        meta = doc.get("metadata", {})
        doc_id = meta.get("document_id", "unknown")
        if doc_id not in seen:
            seen[doc_id] = {
                "document_id": doc_id,
                "filename": meta.get("filename", "Unknown"),
                "file_type": meta.get("file_type", "unknown"),
                "chunk_count": meta.get("total_chunks", 0),
                "upload_date": "",
                "file_size": 0,
                "tags": meta.get("tags", []),
                "status": "indexed",
            }
    
    return {"documents": list(seen.values())}


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its chunks."""
    # Remove from FAISS
    removed = FAISSStore.delete_by_document_id(document_id)
    
    # Remove from MongoDB
    collection = get_collection("documents")
    if collection is not None:
        result = await collection.delete_one({"document_id": document_id})
    
    if removed == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": f"Deleted document {document_id}", "chunks_removed": removed}


@router.get("/stats")
async def get_stats():
    """Get system statistics."""
    from app.services.memory import get_query_stats # type: ignore
    
    # Vector store stats
    vs_stats = FAISSStore.get_stats()
    
    # Document count
    doc_count = 0
    collection = get_collection("documents")
    if collection is not None:
        doc_count = await collection.count_documents({})
    
    # Query stats
    query_stats = await get_query_stats()
    
    return {
        "total_documents": doc_count,
        "total_chunks": vs_stats["total_vectors"],
        "total_queries": query_stats["total_queries"],
        "query_distribution": query_stats["query_distribution"],
        "avg_confidence": query_stats["avg_confidence"],
        "avg_retrieval_latency_ms": query_stats["avg_retrieval_latency_ms"],
        "recent_queries": query_stats["recent_queries"],
    }
