# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""KnowFlux - Adaptive RAG Platform Backend"""
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv # type: ignore

load_dotenv()

from app.api import chat, ingest, documents, health # type: ignore
from app.database.mongodb import connect_db, close_db # type: ignore
from app.vectorstore.faiss_store import FAISSStore # type: ignore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 KnowFlux Backend starting up...")
    print("🔗 Connecting to MongoDB...")
    await connect_db()
    print("📂 Loading FAISS Index...")
    FAISSStore.load_index()
    print("✨ Startup sequence complete. API ready.")
    yield
    print("🛑 Backend shutting down...")
    await close_db()


app = FastAPI(
    title="KnowFlux API",
    description="Adaptive RAG Platform - Intelligent Knowledge Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(ingest.router, prefix="/api", tags=["Ingestion"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
