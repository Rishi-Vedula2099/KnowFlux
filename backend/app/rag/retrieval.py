"""Vector retrieval from FAISS."""
from typing import List, Tuple
from app.vectorstore.faiss_store import FAISSStore
from app.ingestion.embedder import generate_single_embedding


async def retrieve_documents(query: str, top_k: int = 5) -> List[dict]:
    """Retrieve relevant documents from FAISS."""
    try:
        query_embedding = await generate_single_embedding(query)
        results = FAISSStore.search(query_embedding, top_k=top_k)
        
        sources = []
        for doc, score in results:
            sources.append({
                "text": doc.get("text", ""),
                "metadata": doc.get("metadata", {}),
                "relevance_score": round(score, 4),
            })
        
        return sources
    except Exception as e:
        print(f"⚠️ Retrieval failed: {e}")
        return []


async def multi_hop_retrieve(query: str, max_hops: int = 3) -> List[dict]:
    """Multi-hop retrieval with iterative refinement.
    
    1. Initial retrieval
    2. Analyze gaps
    3. Reformulate sub-queries
    4. Retrieve additional context
    """
    all_sources = []
    seen_texts = set()
    
    # Hop 1: Initial retrieval
    initial_docs = await retrieve_documents(query, top_k=3)
    for doc in initial_docs:
        text = doc.get("text", "")
        if text not in seen_texts:
            all_sources.append(doc)
            seen_texts.add(text)
    
    if len(all_sources) < 2:
        return all_sources
    
    # Hop 2+: Generate sub-queries based on initial context
    try:
        import os
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        context_summary = "\n".join([s.get("text", "")[:200] for s in all_sources[:3]])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Generate 2 follow-up search queries to find additional information needed to fully answer the original question. Return one query per line, nothing else."},
                {"role": "user", "content": f"Original question: {query}\n\nContext found so far:\n{context_summary}"},
            ],
            temperature=0.3,
            max_tokens=100,
        )
        
        sub_queries = response.choices[0].message.content.strip().split("\n")
        
        for sub_query in sub_queries[:2]:
            sub_query = sub_query.strip().lstrip("0123456789.-) ")
            if sub_query:
                sub_docs = await retrieve_documents(sub_query, top_k=2)
                for doc in sub_docs:
                    text = doc.get("text", "")
                    if text not in seen_texts:
                        doc["hop_query"] = sub_query
                        all_sources.append(doc)
                        seen_texts.add(text)
    except Exception as e:
        print(f"⚠️ Multi-hop sub-query generation failed: {e}")
    
    return all_sources
