# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Query complexity classifier."""
import os
from typing import Tuple
import json


async def classify_query(query: str, has_documents: bool = False) -> Tuple[str, str]:
    """Classify query complexity using LLM.
    
    Returns:
        Tuple of (query_type, reasoning)
        query_type: 'simple' | 'retrieval' | 'multi_hop' | 'web_search'
    """
    try:
        from openai import OpenAI # type: ignore
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        system_prompt = f"""You are a query complexity classifier for a RAG system.
Classify the user's query into exactly ONE of these categories:

- "simple": General knowledge questions, greetings, simple factual questions that don't need external sources.
- "retrieval": Questions that require searching internal documents/knowledge base. Only use if documents are available ({has_documents}).
- "multi_hop": Complex questions requiring multiple pieces of information combined from different sources. Only use if documents are available ({has_documents}).
- "web_search": Questions about current events, recent news, real-time data, prices, weather, or anything requiring up-to-date information.

Rules:
- If no documents are uploaded and the query needs specific info, prefer "web_search" or "simple"
- If the query mentions "latest", "current", "today", "recent", use "web_search"
- If the query is conversational (hi, hello, thanks), use "simple"

Respond with ONLY a JSON object: {{"type": "<category>", "reasoning": "<brief explanation>"}}"""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            temperature=0,
            max_tokens=150,
        )
        
        import json
        result = json.loads(response.choices[0].message.content.strip())
        return result.get("type", "simple"), result.get("reasoning", "")
        
    except Exception as e:
        print(f"⚠️ Query classification failed: {e}")
        # Fallback heuristic
        return _heuristic_classify(query, has_documents)


def _heuristic_classify(query: str, has_documents: bool) -> Tuple[str, str]:
    """Fallback heuristic classification."""
    query_lower = query.lower()
    
    # Web search indicators
    web_keywords = ["latest", "current", "today", "news", "weather", "price", "stock", "2024", "2025", "2026", "recent"]
    if any(kw in query_lower for kw in web_keywords):
        return "web_search", "Query contains time-sensitive keywords"
    
    # Simple indicators
    simple_keywords = ["hi", "hello", "thanks", "what is", "define", "explain"]
    if any(query_lower.startswith(kw) for kw in simple_keywords) or len(query.split()) < 4:
        return "simple", "Short or conversational query"
    
    # Multi-hop indicators
    multi_hop_keywords = ["compare", "relationship between", "how does", "difference between", "analyze"]
    if has_documents and any(kw in query_lower for kw in multi_hop_keywords):
        return "multi_hop", "Complex analytical query requiring multiple sources"
    
    # Default to retrieval if docs exist, otherwise simple
    if has_documents:
        return "retrieval", "Query may require document search"
    
    return "simple", "Default classification"
