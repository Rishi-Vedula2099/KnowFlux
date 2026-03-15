# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Chat memory management."""
import uuid
from typing import List, Optional
from datetime import datetime
from app.database.mongodb import get_collection # type: ignore


# In-memory fallback when MongoDB is unavailable
_memory_store: dict = {}


async def get_or_create_conversation(conversation_id: Optional[str] = None) -> str:
    """Get existing or create new conversation ID."""
    if conversation_id:
        return conversation_id
    return str(uuid.uuid4())


async def save_message(conversation_id: str, role: str, content: str, metadata: Optional[dict] = None):
    """Save a chat message."""
    message = {
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": metadata or {},
    }
    
    collection = get_collection("chat_history")
    if collection is not None:
        await collection.insert_one(message)
    else:
        # In-memory fallback
        if conversation_id not in _memory_store:
            _memory_store[conversation_id] = []
        _memory_store[conversation_id].append(message)


async def get_chat_history(conversation_id: str, limit: int = 20) -> List[dict]:
    """Get recent chat history for a conversation."""
    collection = get_collection("chat_history")
    if collection is not None:
        cursor = collection.find(
            {"conversation_id": conversation_id},
            {"_id": 0},
        ).sort("timestamp", -1).limit(limit)
        messages = await cursor.to_list(length=limit)
        messages.reverse()
        return messages
    else:
        # In-memory fallback
        messages = _memory_store.get(conversation_id, [])
        return messages[-limit:]


async def save_query_stats(query: str, query_type: str, confidence: float, latency_ms: float):
    """Save query statistics for analytics."""
    stat = {
        "query": query,
        "query_type": query_type,
        "confidence": confidence,
        "latency_ms": latency_ms,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    collection = get_collection("query_stats")
    if collection is not None:
        await collection.insert_one(stat)
    else:
        if "_stats" not in _memory_store:
            _memory_store["_stats"] = []
        _memory_store["_stats"].append(stat)


async def get_query_stats() -> dict:
    """Get aggregated query statistics."""
    collection = get_collection("query_stats")
    
    stats_list = []
    if collection is not None:
        cursor = collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(100)
        stats_list = await cursor.to_list(length=100)
    else:
        stats_list = _memory_store.get("_stats", [])[-100:]
    
    if not stats_list:
        return {
            "total_queries": 0,
            "query_distribution": {"simple": 0, "retrieval": 0, "multi_hop": 0, "web_search": 0},
            "avg_confidence": 0.0,
            "avg_retrieval_latency_ms": 0.0,
            "recent_queries": [],
        }
    
    distribution = {"simple": 0, "retrieval": 0, "multi_hop": 0, "web_search": 0}
    total_confidence = 0
    total_latency = 0
    
    for stat in stats_list:
        qt = stat.get("query_type", "simple")
        distribution[qt] = distribution.get(qt, 0) + 1
        total_confidence += stat.get("confidence", 0)
        total_latency += stat.get("latency_ms", 0)
    
    n = len(stats_list)
    avg_confidence = float(total_confidence) / n if n else 0.0
    avg_latency = float(total_latency) / n if n else 0.0
    return {
        "total_queries": n,
        "query_distribution": distribution,
        "avg_confidence": round(avg_confidence, 3), # type: ignore
        "avg_retrieval_latency_ms": round(avg_latency, 1), # type: ignore
        "recent_queries": [
            {"query": s.get("query", "")[:100], "type": s.get("query_type"), "confidence": s.get("confidence")}
            for s in stats_list[:10]
        ],
    }
