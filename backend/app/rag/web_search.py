"""Web search using Tavily."""
import os
from typing import List


async def search_web(query: str, max_results: int = 5) -> List[dict]:
    """Search the web using Tavily API."""
    try:
        from tavily import TavilyClient
        
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            return _fallback_web_response(query)
        
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            max_results=max_results,
            include_answer=True,
            search_depth="advanced",
        )
        
        sources = []
        for result in response.get("results", []):
            sources.append({
                "text": result.get("content", ""),
                "metadata": {
                    "source": "web",
                    "url": result.get("url", ""),
                    "title": result.get("title", ""),
                },
                "relevance_score": result.get("score", 0.5),
            })
        
        return sources
        
    except Exception as e:
        print(f"⚠️ Web search failed: {e}")
        return _fallback_web_response(query)


def _fallback_web_response(query: str) -> List[dict]:
    """Fallback when web search is unavailable."""
    return [{
        "text": f"Web search is currently unavailable. The query was: {query}",
        "metadata": {"source": "fallback", "url": "", "title": "Web Search Unavailable"},
        "relevance_score": 0.0,
    }]
