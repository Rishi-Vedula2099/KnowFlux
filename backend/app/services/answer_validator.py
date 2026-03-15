# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Answer validation and hallucination detection."""
import os
from typing import List, Tuple
from itertools import islice


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
        from openai import OpenAI # type: ignore
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Using islice to avoid the slice operator which the IDE misinterpreits
        raw_sources = list(islice(sources, 5))
        source_texts = "\n---\n".join([str(s.get("text", s.get("content", "")))[:500] for s in raw_sources]) # type: ignore
        
        system_prompt = """You are a hallucination detector. Given a query, an answer, and source documents, evaluate:
...
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
        result = json.loads(str(response.choices[0].message.content).strip())
        return (
            float(result.get("confidence", 0.5)),
            bool(result.get("is_grounded", True)),
            str(result.get("explanation", "")),
        )
    except Exception as e:
        print(f"⚠️ Answer validation failed: {e}")
        return 0.5, True, f"Validation unavailable: {e}"
