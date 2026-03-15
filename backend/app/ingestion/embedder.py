# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Embedding generation using OpenAI."""
import os
from typing import List
from itertools import islice


_client = None


def _get_client():
    """Lazy init OpenAI client."""
    global _client
    if _client is None:
        try:
            from openai import OpenAI # type: ignore
            _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except Exception as e:
            print(f"⚠️ OpenAI client init failed: {e}")
    return _client


async def generate_embeddings(texts: List[str], model: str = "text-embedding-3-large") -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    client = _get_client()
    if client is None:
        raise RuntimeError("OpenAI client not available. Set OPENAI_API_KEY.")
    
    # Process in batches of 100
    all_embeddings = []
    batch_size = 100
    
    for i in range(0, len(texts), batch_size):
        # Using islice to avoid the slice operator which the IDE misinterpreits
        batch = list(islice(texts, i, i + batch_size))
        response = client.embeddings.create(
            model=model,
            input=batch,
        )
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)
    
    return all_embeddings


async def generate_single_embedding(text: str, model: str = "text-embedding-3-large") -> List[float]:
    """Generate embedding for a single text."""
    embeddings = await generate_embeddings([text], model)
    return embeddings[0]
