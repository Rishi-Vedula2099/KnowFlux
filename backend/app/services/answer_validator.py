"""Answer validation and hallucination detection."""
import os
from typing import List, Tuple


async def validate_answer(
    answer: str,
    query: str,
    sources: List[dict],
) -> Tuple[float, bool, str]:
    """Validate answer against sources for hallucination detection.
    
    Returns:
        Tuple of (confidence_score, is_grounded, explanation)
    """
    if not sources:
        # No sources to validate against - moderate confidence for direct LLM
        return 0.7, True, "Direct LLM response without source validation"
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        source_texts = "\n---\n".join([s.get("text", s.get("content", ""))[:500] for s in sources[:5]])
        
        system_prompt = """You are a hallucination detector. Given a query, an answer, and source documents, evaluate:

1. Is the answer grounded in the provided sources?
2. Does the answer contain unsupported claims?
3. Rate confidence from 0.0 to 1.0

Respond with ONLY a JSON object:
{"confidence": 0.85, "is_grounded": true, "explanation": "brief explanation"}"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Query: {query}\n\nAnswer: {answer}\n\nSources:\n{source_texts}"},
            ],
            temperature=0,
            max_tokens=200,
        )
        
        import json
        result = json.loads(response.choices[0].message.content.strip())
        return (
            result.get("confidence", 0.5),
            result.get("is_grounded", True),
            result.get("explanation", ""),
        )
    except Exception as e:
        print(f"⚠️ Answer validation failed: {e}")
        return 0.5, True, f"Validation unavailable: {e}"
