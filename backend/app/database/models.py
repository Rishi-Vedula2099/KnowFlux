# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""Pydantic models for the application."""
from pydantic import BaseModel, Field # type: ignore
from typing import Optional, List
from datetime import datetime
from enum import Enum


class QueryType(str, Enum):
    SIMPLE = "simple"
    RETRIEVAL = "retrieval"
    MULTI_HOP = "multi_hop"
    WEB_SEARCH = "web_search"


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sources: Optional[List[dict]] = None
    query_type: Optional[QueryType] = None
    confidence: Optional[float] = None
    reasoning_trace: Optional[List[str]] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict] = []
    query_type: QueryType
    confidence: float = 0.0
    conversation_id: str
    reasoning_trace: List[str] = []


class DocumentMetadata(BaseModel):
    id: Optional[str] = None
    filename: str
    file_type: str
    chunk_count: int = 0
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_size: int = 0
    tags: List[str] = []
    status: str = "processing"


class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    chunk_count: int
    upload_date: str
    file_size: int
    tags: List[str]
    status: str


class StatsResponse(BaseModel):
    total_documents: int = 0
    total_chunks: int = 0
    total_queries: int = 0
    query_distribution: dict = {}
    avg_confidence: float = 0.0
    avg_retrieval_latency_ms: float = 0.0
    recent_queries: List[dict] = []


class UploadResponse(BaseModel):
    message: str
    document_id: str
    filename: str
    chunk_count: int
