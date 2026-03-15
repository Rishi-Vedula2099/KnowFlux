# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Response generation with citations."""
import os
from typing import List, AsyncGenerator, Optional
from itertools import islice


async def generate_response(
    query: str,
    sources: List[dict],
    chat_history: Optional[List[dict]] = None,
    query_type: str = "simple",
) -> str:
    """Generate a response using GPT-4o with context and citations."""
    try:
        from openai import OpenAI # type: ignore
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Build context from sources
        context = ""
        if sources:
            context_parts: List[str] = []
            for i, source in enumerate(sources, 1):
                raw_text = str(source.get("text", ""))
                # Using islice to avoid the slice operator which the IDE misinterpreits
                text = "".join(islice(raw_text, 1000))
                meta = source.get("metadata", {})
                src_label = meta.get("filename", meta.get("title", meta.get("url", f"Source {i}")))
                context_parts.append(f"[Source {i}: {src_label}]\n{text}")
            context = "\n\n---\n\n".join(context_parts)
        
        # Build system prompt
        system_prompt = _build_system_prompt(query_type, bool(sources))
        
        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add chat history
        if chat_history:
            # Using islice for consistent robust pattern
            for msg in islice(reversed(chat_history), 6):
                messages.insert(1, {
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })
        
        # Add context + query
        user_content = query
        if context:
            user_content = f"Context from retrieved sources:\n\n{context}\n\n---\n\nUser Question: {query}"
        
        messages.append({"role": "user", "content": user_content})
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=2000,
        )
        
        return str(response.choices[0].message.content)
        
    except Exception as e:
        return f"I apologize, but I encountered an error generating a response: {str(e)}. Please ensure your OpenAI API key is configured correctly."


async def generate_response_stream(
    query: str,
    sources: List[dict],
    chat_history: Optional[List[dict]] = None,
    query_type: str = "simple",
) -> AsyncGenerator[str, None]:
    """Stream response using GPT-4o."""
    try:
        from openai import OpenAI # type: ignore
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        context = ""
        if sources:
            context_parts: List[str] = []
            for i, source in enumerate(sources, 1):
                raw_text = str(source.get("text", ""))
                text = "".join(islice(raw_text, 1000))
                meta = source.get("metadata", {})
                src_label = meta.get("filename", meta.get("title", meta.get("url", f"Source {i}")))
                context_parts.append(f"[Source {i}: {src_label}]\n{text}")
            context = "\n\n---\n\n".join(context_parts)
        
        system_prompt = _build_system_prompt(query_type, bool(sources))
        messages = [{"role": "system", "content": system_prompt}]
        
        if chat_history:
            for msg in islice(reversed(chat_history), 6):
                messages.insert(1, {
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })
        
        user_content = query
        if context:
            user_content = f"Context from retrieved sources:\n\n{context}\n\n---\n\nUser Question: {query}"
        
        messages.append({"role": "user", "content": user_content})
        
        stream = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=2000,
            stream=True,
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield str(chunk.choices[0].delta.content)
                
    except Exception as e:
        yield f"Error: {str(e)}"


def _build_system_prompt(query_type: str, has_sources: bool) -> str:
    """Build system prompt based on query type."""
    base = """You are KnowFlux, an advanced AI knowledge assistant. You provide accurate, well-structured, and helpful responses.

Key behaviors:
- Use markdown formatting for clear, readable responses
- When citing sources, use [Source N] notation
- Be concise but thorough
- If you're unsure, say so honestly
"""
    
    if query_type == "retrieval" and has_sources:
        base += """
You are answering based on retrieved documents. Ground your answer in the provided sources.
Always cite which source(s) your information comes from using [Source N] notation.
If the sources don't contain relevant information, say so clearly."""
    
    elif query_type == "multi_hop" and has_sources:
        base += """
You are performing multi-hop reasoning across multiple sources. 
Synthesize information from different sources to provide a comprehensive answer.
Show your reasoning process and cite all relevant sources."""
    
    elif query_type == "web_search":
        base += """
You are answering using web search results. Provide up-to-date information.
Cite the sources with their URLs when possible.
Note any information that may change over time."""
    
    return base
