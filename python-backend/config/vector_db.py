"""
Vector Store — ChromaDB wrapper for Egyptian MOETE curriculum RAG.
Handles document ingestion, retrieval and similarity search.
"""
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Tuple, Optional, Dict, Any
import hashlib
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self, persist_directory: str = "./data/chroma_db"):
        self.client = chromadb.Client(
            chromadb.Settings(
                anonymized_telemetry=False,
                is_persistent=True,
                persist_directory=persist_directory,
            )
        )
        # Use default embedding (all-MiniLM-L6-v2)
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="manhaji_curriculum",
            embedding_function=self.ef,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"VectorStore ready — {self.collection.count()} docs")

    # ------------------------------------------------------------------ ingest
    def add_document(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        doc_id: Optional[str] = None,
    ) -> str:
        """Add a single document chunk."""
        if not doc_id:
            doc_id = hashlib.md5(text.encode()).hexdigest()
        meta = metadata or {}
        self.collection.upsert(ids=[doc_id], documents=[text], metadatas=[meta])
        return doc_id

    def add_documents(
        self,
        texts: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
    ) -> int:
        """Batch-add documents."""
        if not ids:
            ids = [hashlib.md5(t.encode()).hexdigest() for t in texts]
        metas = metadatas or [{}] * len(texts)
        self.collection.upsert(ids=ids, documents=texts, metadatas=metas)
        return len(texts)

    # --------------------------------------------------------------- retrieve
    def retrieve(
        self,
        query: str,
        grade: Optional[int] = None,
        subject: Optional[str] = None,
        top_k: int = 5,
    ) -> Tuple[str, List[str]]:
        """Retrieve relevant context for a query.
        Returns (combined_context_string, list_of_source_labels).
        """
        where_filter: Optional[Dict] = None
        conditions = []
        if grade:
            conditions.append({"grade": str(grade)})
        if subject:
            conditions.append({"subject": subject})
        if len(conditions) == 1:
            where_filter = conditions[0]
        elif len(conditions) > 1:
            where_filter = {"$and": conditions}

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_filter if where_filter else None,
            )
        except Exception:
            # Fallback without filter
            results = self.collection.query(query_texts=[query], n_results=top_k)

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]

        context = "\n---\n".join(docs)
        sources = [
            m.get("source", m.get("lesson_id", f"doc-{i}"))
            for i, m in enumerate(metas)
        ]
        return context, sources

    # ----------------------------------------------------------------- stats
    def get_stats(self) -> Dict[str, Any]:
        return {"total_documents": self.collection.count()}
