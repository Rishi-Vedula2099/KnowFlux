"""KnowFlux - Adaptive RAG Platform Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from app.api import chat, ingest, documents, health
from app.database.mongodb import connect_db, close_db
from app.vectorstore.faiss_store import FAISSStore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    FAISSStore.load_index()
    yield
    await close_db()


app = FastAPI(
    title="KnowFlux API",
    description="Adaptive RAG Platform - Intelligent Knowledge Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
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
