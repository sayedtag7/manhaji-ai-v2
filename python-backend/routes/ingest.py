"""
Ingestion routes — Upload and index curriculum documents into ChromaDB.
Supports PDF, text, and bulk ingestion with citation metadata tracking.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import hashlib
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
    notebook_id: Optional[str] = None
    page_number: Optional[int] = None
    document_name: Optional[str] = None


class BulkPayload(BaseModel):
    documents: List[DocumentPayload]


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[dict]:
    """Split text into overlapping chunks with page/position metadata."""
    chunks = []
    words = text.split()
    total_words = len(words)
    start = 0
    chunk_index = 0

    while start < total_words:
        end = min(start + chunk_size, total_words)
        chunk_text = " ".join(words[start:end])
        # Estimate page number (roughly 300 words per page)
        estimated_page = (start // 300) + 1
        chunks.append({
            "text": chunk_text,
            "chunk_index": chunk_index,
            "estimated_page": estimated_page,
            "start_word": start,
            "end_word": end,
        })
        start += chunk_size - overlap
        chunk_index += 1

    return chunks


@router.post("/document")
async def ingest_document(payload: DocumentPayload):
    """Ingest a single curriculum document chunk with citation metadata."""
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
    if payload.notebook_id:
        metadata["notebook_id"] = payload.notebook_id
    if payload.page_number:
        metadata["page_number"] = str(payload.page_number)
    if payload.document_name:
        metadata["document_name"] = payload.document_name

    doc_id = _vector_store.add_document(payload.text, metadata)
    return {"status": "indexed", "doc_id": doc_id}


@router.post("/document-chunked")
async def ingest_document_chunked(payload: DocumentPayload):
    """Ingest a large document by automatically chunking it with overlap.
    Each chunk retains citation metadata (document name, estimated page).
    """
    if not _vector_store:
        raise HTTPException(status_code=503, detail="Vector store not ready")

    chunks = _chunk_text(payload.text)
    doc_ids = []

    for chunk in chunks:
        metadata = {}
        if payload.grade:
            metadata["grade"] = str(payload.grade)
        if payload.subject:
            metadata["subject"] = payload.subject
        if payload.lesson_id:
            metadata["lesson_id"] = payload.lesson_id
        if payload.notebook_id:
            metadata["notebook_id"] = payload.notebook_id

        # Citation metadata
        doc_name = payload.document_name or payload.source or "Document"
        metadata["source"] = f"{doc_name} (صفحة {chunk['estimated_page']})"
        metadata["document_name"] = doc_name
        metadata["page_number"] = str(chunk["estimated_page"])
        metadata["chunk_index"] = str(chunk["chunk_index"])

        doc_id = hashlib.md5(
            f"{doc_name}_{chunk['chunk_index']}".encode()
        ).hexdigest()
        _vector_store.add_document(chunk["text"], metadata, doc_id=doc_id)
        doc_ids.append(doc_id)

    return {
        "status": "indexed",
        "chunks_created": len(chunks),
        "doc_ids": doc_ids,
        "document_name": payload.document_name or payload.source,
    }


@router.post("/notebook-content")
async def ingest_notebook_content(payload: DocumentPayload):
    """Ingest student notebook content for personalized RAG.
    Linked via notebook_id so AI responses can cite student's own notes.
    """
    if not _vector_store:
        raise HTTPException(status_code=503, detail="Vector store not ready")

    metadata = {
        "type": "student_notebook",
        "notebook_id": payload.notebook_id or "unknown",
        "source": f"ملاحظات الطالب - {payload.document_name or 'دفتر'}",
    }
    if payload.grade:
        metadata["grade"] = str(payload.grade)
    if payload.subject:
        metadata["subject"] = payload.subject
    if payload.lesson_id:
        metadata["lesson_id"] = payload.lesson_id

    doc_id = _vector_store.add_document(payload.text, metadata)
    return {"status": "indexed", "doc_id": doc_id, "type": "student_notebook"}


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
        if d.document_name:
            m["document_name"] = d.document_name
        if d.page_number:
            m["page_number"] = str(d.page_number)
        metas.append(m)

    count = _vector_store.add_documents(texts, metas)
    return {"status": "indexed", "count": count}


@router.get("/stats")
async def store_stats():
    """Get vector store statistics."""
    if not _vector_store:
        return {"total_documents": 0}
    return _vector_store.get_stats()
