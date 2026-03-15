# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Document loaders for various file types."""
import os
import tempfile
from typing import List
from pathlib import Path


async def load_document(file_path: str, file_type: str) -> str:
    """Load document content based on file type."""
    
    if file_type == "pdf":
        return _load_pdf(file_path)
    elif file_type == "docx":
        return _load_docx(file_path)
    elif file_type in ("txt", "md", "markdown"):
        return _load_text(file_path)
    else:
        return _load_text(file_path)


def _load_pdf(file_path: str) -> str:
    """Load PDF document."""
    try:
        from langchain_community.document_loaders import PyPDFLoader # type: ignore
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        return "\n\n".join([str(doc.page_content) for doc in docs])
    except ImportError:
        # Fallback: try basic PDF reading
        try:
            import fitz  # PyMuPDF # type: ignore
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += str(page.get_text()) + "\n\n"
            return text
        except ImportError:
            raise ImportError("Install pypdf or PyMuPDF to process PDF files")


def _load_docx(file_path: str) -> str:
    """Load DOCX document."""
    try:
        from langchain_community.document_loaders import Docx2txtLoader # type: ignore
        loader = Docx2txtLoader(file_path)
        docs = loader.load()
        return "\n\n".join([str(doc.page_content) for doc in docs])
    except ImportError:
        try:
            import docx2txt # type: ignore
            return str(docx2txt.process(file_path))
        except ImportError:
            raise ImportError("Install docx2txt to process DOCX files")


def _load_text(file_path: str) -> str:
    """Load plain text document."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


async def load_url(url: str) -> str:
    """Load content from a URL."""
    try:
        from langchain_community.document_loaders import WebBaseLoader # type: ignore
        loader = WebBaseLoader(url)
        docs = loader.load()
        return "\n\n".join([str(doc.page_content) for doc in docs])
    except Exception as e:
        raise ValueError(f"Failed to load URL: {e}")


def get_file_type(filename: str) -> str:
    """Determine file type from filename."""
    ext = Path(filename).suffix.lower().lstrip(".")
    type_map = {
        "pdf": "pdf",
        "docx": "docx",
        "doc": "docx",
        "txt": "txt",
        "md": "md",
        "markdown": "md",
    }
    return type_map.get(ext, "txt")
