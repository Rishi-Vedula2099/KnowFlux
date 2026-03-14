"""Text splitting for document chunks."""
from typing import List


def split_text(text: str, chunk_size: int = 800, chunk_overlap: int = 150) -> List[str]:
    """Split text into overlapping chunks by token approximation.
    
    Uses character-based splitting with ~4 chars per token heuristic.
    """
    char_chunk_size = chunk_size * 4  # ~4 chars per token
    char_overlap = chunk_overlap * 4
    
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=char_chunk_size,
            chunk_overlap=char_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        return splitter.split_text(text)
    except ImportError:
        # Fallback manual splitting
        return _manual_split(text, char_chunk_size, char_overlap)


def _manual_split(text: str, chunk_size: int, overlap: int) -> List[str]:
    """Manual text splitting fallback."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks
