"""Document ingestion API."""
import os
import uuid
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from datetime import datetime

from app.ingestion.loaders import load_document, load_url, get_file_type
from app.ingestion.splitter import split_text
from app.ingestion.embedder import generate_embeddings
from app.vectorstore.faiss_store import FAISSStore
from app.database.mongodb import get_collection
from app.database.models import UploadResponse

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    tags: Optional[str] = Form(""),
):
    """Upload and ingest a document or URL."""
    if not file and not url:
        raise HTTPException(status_code=400, detail="Provide either a file or URL")
    
    document_id = str(uuid.uuid4())
    
    try:
        if file:
            # Handle file upload
            file_type = get_file_type(file.filename)
            allowed_types = {"pdf", "docx", "txt", "md"}
            if file_type not in allowed_types:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")
            
            # Save to temp file
            content = await file.read()
            suffix = f".{file_type}" if file_type != "md" else ".md"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            
            # Load document
            text = await load_document(tmp_path, file_type)
            os.unlink(tmp_path)  # Clean up
            
            filename = file.filename
            file_size = len(content)
        else:
            # Handle URL
            text = await load_url(url)
            filename = url
            file_type = "url"
            file_size = len(text.encode())
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Document is empty or could not be parsed")
        
        # Split into chunks
        chunks = split_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No text chunks generated")
        
        # Generate embeddings
        embeddings = await generate_embeddings(chunks)
        
        # Prepare metadata
        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
        metadatas = [
            {
                "document_id": document_id,
                "filename": filename,
                "file_type": file_type,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "tags": tag_list,
            }
            for i in range(len(chunks))
        ]
        
        # Store in FAISS
        added = FAISSStore.add_documents(chunks, embeddings, metadatas)
        
        # Store metadata in MongoDB
        doc_meta = {
            "document_id": document_id,
            "filename": filename,
            "file_type": file_type,
            "chunk_count": len(chunks),
            "upload_date": datetime.utcnow().isoformat(),
            "file_size": file_size,
            "tags": tag_list,
            "status": "indexed",
        }
        
        collection = get_collection("documents")
        if collection is not None:
            await collection.insert_one(doc_meta)
        
        return UploadResponse(
            message=f"Successfully ingested {filename}",
            document_id=document_id,
            filename=filename,
            chunk_count=len(chunks),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
