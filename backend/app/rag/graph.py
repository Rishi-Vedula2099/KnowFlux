"""LangGraph Adaptive RAG Workflow."""
import time
from typing import TypedDict, List, Optional, Annotated
from app.services.query_classifier import classify_query
from app.services.answer_validator import validate_answer
from app.services.memory import get_chat_history, save_message, save_query_stats
from app.rag.router import route_query
from app.rag.retrieval import retrieve_documents, multi_hop_retrieve
from app.rag.web_search import search_web
from app.rag.generator import generate_response, generate_response_stream
from app.vectorstore.faiss_store import FAISSStore


class RAGState(TypedDict):
    """State for the RAG workflow."""
    query: str
    conversation_id: str
    query_type: str
    reasoning_trace: List[str]
    sources: List[dict]
    answer: str
    confidence: float
    is_grounded: bool
    validation_note: str
    chat_history: List[dict]
    latency_ms: float


async def run_adaptive_rag(query: str, conversation_id: str) -> dict:
    """Execute the full adaptive RAG pipeline.
    
    Flow:
    1. Load chat history
    2. Classify query complexity
    3. Route to appropriate retrieval strategy
    4. Generate response
    5. Validate answer
    6. Save to memory
    """
    start_time = time.time()
    reasoning_trace = []
    
    # Step 1: Load chat history
    chat_history = await get_chat_history(conversation_id, limit=10)
    reasoning_trace.append("📋 Loaded conversation history")
    
    # Step 2: Classify query
    has_documents = FAISSStore.get_stats()["total_vectors"] > 0
    query_type, classification_reason = await classify_query(query, has_documents)
    reasoning_trace.append(f"🔍 Query classified as: {query_type} ({classification_reason})")
    
    # Step 3: Route and retrieve
    route = route_query(query_type)
    reasoning_trace.append(f"🔀 Routed to: {route}")
    
    sources = []
    if route == "vector_retrieval":
        sources = await retrieve_documents(query, top_k=5)
        reasoning_trace.append(f"📚 Retrieved {len(sources)} documents from vector store")
        
        # Self-correcting RAG: if no relevant sources found, try web search
        if not sources or (sources and sources[0].get("relevance_score", 0) < 0.3):
            reasoning_trace.append("⚠️ Low relevance scores - reformulating query")
            query_type = "web_search"
            sources = await search_web(query, max_results=3)
            reasoning_trace.append(f"🌐 Fell back to web search: {len(sources)} results")
    
    elif route == "multi_hop_retrieval":
        sources = await multi_hop_retrieve(query, max_hops=3)
        reasoning_trace.append(f"🔗 Multi-hop retrieval: {len(sources)} sources across hops")
    
    elif route == "web_search":
        sources = await search_web(query, max_results=5)
        reasoning_trace.append(f"🌐 Web search: {len(sources)} results")
    
    else:  # direct_llm
        reasoning_trace.append("💡 Direct LLM response (no retrieval needed)")
    
    # Step 4: Generate response
    answer = await generate_response(query, sources, chat_history, query_type)
    reasoning_trace.append("✨ Generated response")
    
    # Step 5: Validate answer
    confidence, is_grounded, validation_note = await validate_answer(answer, query, sources)
    reasoning_trace.append(f"✅ Validation: confidence={confidence}, grounded={is_grounded}")
    
    # Self-correcting: if not grounded and we have sources, re-generate
    if not is_grounded and sources:
        reasoning_trace.append("🔄 Answer not grounded - regenerating with stricter grounding")
        answer = await generate_response(
            query + "\n\nIMPORTANT: Only use information from the provided sources.",
            sources, chat_history, query_type,
        )
        confidence, is_grounded, validation_note = await validate_answer(answer, query, sources)
        reasoning_trace.append(f"✅ Re-validation: confidence={confidence}, grounded={is_grounded}")
    
    latency_ms = (time.time() - start_time) * 1000
    
    # Step 6: Save to memory
    await save_message(conversation_id, "user", query)
    await save_message(conversation_id, "assistant", answer, {
        "query_type": query_type,
        "confidence": confidence,
        "sources_count": len(sources),
    })
    await save_query_stats(query, query_type, confidence, latency_ms)
    reasoning_trace.append(f"💾 Saved to memory (latency: {latency_ms:.0f}ms)")
    
    # Format sources for response
    formatted_sources = []
    for s in sources:
        meta = s.get("metadata", {})
        formatted_sources.append({
            "content": s.get("text", "")[:300],
            "source": meta.get("filename", meta.get("title", meta.get("url", "Unknown"))),
            "url": meta.get("url", ""),
            "relevance": s.get("relevance_score", 0),
        })
    
    return {
        "answer": answer,
        "sources": formatted_sources,
        "query_type": query_type,
        "confidence": confidence,
        "conversation_id": conversation_id,
        "reasoning_trace": reasoning_trace,
    }


async def run_adaptive_rag_stream(query: str, conversation_id: str):
    """Execute adaptive RAG with streaming response.
    
    Yields SSE-formatted events.
    """
    import json
    start_time = time.time()
    reasoning_trace = []
    
    # Classify
    has_documents = FAISSStore.get_stats()["total_vectors"] > 0
    query_type, classification_reason = await classify_query(query, has_documents)
    reasoning_trace.append(f"🔍 Classified as: {query_type}")
    
    # Yield metadata
    yield f"data: {json.dumps({'type': 'metadata', 'query_type': query_type, 'reasoning': classification_reason})}\n\n"
    
    # Route and retrieve
    route = route_query(query_type)
    reasoning_trace.append(f"🔀 Route: {route}")
    
    sources = []
    if route == "vector_retrieval":
        sources = await retrieve_documents(query, top_k=5)
        reasoning_trace.append(f"📚 Retrieved {len(sources)} docs")
    elif route == "multi_hop_retrieval":
        sources = await multi_hop_retrieve(query, max_hops=3)
        reasoning_trace.append(f"🔗 Multi-hop: {len(sources)} sources")
    elif route == "web_search":
        sources = await search_web(query, max_results=5)
        reasoning_trace.append(f"🌐 Web: {len(sources)} results")
    else:
        reasoning_trace.append("💡 Direct LLM")
    
    # Yield sources
    formatted_sources = []
    for s in sources:
        meta = s.get("metadata", {})
        formatted_sources.append({
            "content": s.get("text", "")[:300],
            "source": meta.get("filename", meta.get("title", meta.get("url", "Unknown"))),
            "url": meta.get("url", ""),
            "relevance": s.get("relevance_score", 0),
        })
    
    yield f"data: {json.dumps({'type': 'sources', 'sources': formatted_sources})}\n\n"
    yield f"data: {json.dumps({'type': 'reasoning', 'trace': reasoning_trace})}\n\n"
    
    # Stream response
    chat_history = await get_chat_history(conversation_id, limit=10)
    full_answer = ""
    
    async for chunk in generate_response_stream(query, sources, chat_history, query_type):
        full_answer += chunk
        yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
    
    # Validate
    confidence, is_grounded, validation_note = await validate_answer(full_answer, query, sources)
    
    latency_ms = (time.time() - start_time) * 1000
    
    # Save
    await save_message(conversation_id, "user", query)
    await save_message(conversation_id, "assistant", full_answer, {
        "query_type": query_type, "confidence": confidence,
    })
    await save_query_stats(query, query_type, confidence, latency_ms)
    
    # Final event
    yield f"data: {json.dumps({'type': 'done', 'confidence': confidence, 'is_grounded': is_grounded, 'conversation_id': conversation_id})}\n\n"
