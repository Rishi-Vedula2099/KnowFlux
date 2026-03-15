"""Query routing logic."""
from app.database.models import QueryType


def route_query(query_type: str) -> str:
    """Route to the appropriate retrieval strategy node."""
    routing_map = {
        "simple": "direct_llm",
        "retrieval": "vector_retrieval",
        "multi_hop": "multi_hop_retrieval",
        "web_search": "web_search",
    }
    return routing_map.get(query_type, "direct_llm")
