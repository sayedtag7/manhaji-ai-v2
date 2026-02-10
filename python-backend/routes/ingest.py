"""
Ingestion routes — Upload and index curriculum documents into ChromaDB.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

_vector_store = None


def init_ingest(vector_store):
    global _vector_store
    _vector_store = vector_store


class DocumentPayload(BaseModel):
    text: str
    grade: Optional[int] = None
    subject: Optional[str] = None
    lesson_id: Optional[str] = None
    source: Optional[str] = None


class BulkPayload(BaseModel):
    documents: List[DocumentPayload]


@router.post("/document")
async def ingest_document(payload: DocumentPayload):
    """Ingest a single curriculum document chunk."""
    if not _vector_store:
        raise HTTPException(status_code=503, detail="Vector store not ready")

    metadata = {}
    if payload.grade:
        metadata["grade"] = str(payload.grade)
    if payload.subject:
        metadata["subject"] = payload.subject
    if payload.lesson_id:
        metadata["lesson_id"] = payload.lesson_id
    if payload.source:
        metadata["source"] = payload.source

    doc_id = _vector_store.add_document(payload.text, metadata)
    return {"status": "indexed", "doc_id": doc_id}


@router.post("/bulk")
async def ingest_bulk(payload: BulkPayload):
    """Ingest multiple documents at once."""
    if not _vector_store:
        raise HTTPException(status_code=503, detail="Vector store not ready")

    texts = [d.text for d in payload.documents]
    metas = []
    for d in payload.documents:
        m = {}
        if d.grade:
            m["grade"] = str(d.grade)
        if d.subject:
            m["subject"] = d.subject
        if d.lesson_id:
            m["lesson_id"] = d.lesson_id
        if d.source:
            m["source"] = d.source
        metas.append(m)

    count = _vector_store.add_documents(texts, metas)
    return {"status": "indexed", "count": count}


@router.get("/stats")
async def store_stats():
    """Get vector store statistics."""
    if not _vector_store:
        return {"total_documents": 0}
    return _vector_store.get_stats()
