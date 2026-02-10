# Knowledge Base Setup & Curriculum Seeding Guide

## Overview

This guide explains how to ground Manhaji's AI system in the MOETE curriculum (Grades 7-10 Math/Science) to ensure accurate, curriculum-aligned responses. The knowledge base uses **Retrieval-Augmented Generation (RAG)** to cite verified sources.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Curriculum Data Sources](#curriculum-data-sources)
4. [Seeding Process](#seeding-process)
5. [Vector Database Setup](#vector-database-setup)
6. [Testing RAG Responses](#testing-rag-responses)
7. [Maintenance & Updates](#maintenance--updates)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT QUERY                             │
│              "How do I solve simultaneous equations?"            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (aiEngineService)                    │
│  - Sends query to backend /api/chat/query                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python FastAPI)                      │
│  1. Receive query                                                │
│  2. Extract student context (grade, current lesson, history)     │
│  3. Generate embedding for query                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│             VECTOR DATABASE (Pinecone/Qdrant/pgvector)           │
│  - Search for semantically similar curriculum chunks             │
│  - Return top 5 relevant sections with metadata                  │
│    (lesson_id, page_number, moete_reference)                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAG PROMPT CONSTRUCTION                       │
│  System Prompt:                                                  │
│    - Educational philosophy (Socratic, MOETE-aligned)            │
│    - Retrieved curriculum context (ground truth)                 │
│    - Misconception patterns                                      │
│  User Prompt:                                                    │
│    - Student's actual question                                   │
│    - Student's grade and current lesson                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LLM (Gemini/GPT/Claude)                     │
│  - Generates response grounded in retrieved curriculum           │
│  - Includes citations: (Source: MOETE G8 Math, Page 45)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE POST-PROCESSING                      │
│  - Misconception detection (NLP check)                           │
│  - Add visual generation spec if needed                          │
│  - Log interaction for analytics                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN TO STUDENT                             │
│  "To solve simultaneous equations, use substitution:..."         │
│  (Source: MOETE Grade 8 Math Textbook, Unit 1, Lesson 2)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before seeding the knowledge base, ensure:

1. ✅ Backend Python environment is set up (FastAPI)
2. ✅ Vector database is running (Pinecone, Qdrant, or pgvector)
3. ✅ LLM API key is configured (.env file)
4. ✅ Embedding model is available (e.g., `text-embedding-004` from Gemini)

### Install Required Python Packages

```bash
cd python-backend
pip install -r requirements.txt

# Additional packages for knowledge base seeding:
pip install langchain langchain-google-genai
pip install pinecone-client  # or qdrant-client, or pgvector
pip install pypdf2 pillow pytesseract  # for PDF/image ingestion
pip install sentence-transformers  # for embeddings
```

---

## Curriculum Data Sources

### Primary Sources (MOETE Alignment)

1. **Official MOETE Textbooks** (Grades 7-10 Math/Science)
   - Format: PDF scans of official Ministry textbooks
   - Location: `python-backend/data/curriculum/moete/`
   - Files needed:
     - `grade7_math_textbook.pdf`
     - `grade8_math_textbook.pdf`
     - `grade7_science_textbook.pdf`
     - etc.

2. **Teacher-Curated Misconception Library**
   - Format: JSON file
   - Location: `python-backend/data/misconceptions/common_errors.json`
   - Structure:
     ```json
     [
       {
         "concept": "Algebraic Sign Manipulation",
         "grade": 8,
         "subject": "Mathematics",
         "incorrectReasoning": "Moving a term keeps the same sign",
         "correctReasoning": "Moving across = requires sign change",
         "examples": ["2x + 3 = 7 → 2x = 7 + 3 (WRONG)"],
         "moeteReference": "G8-M-1.1.2"
       }
     ]
     ```

3. **Past Exam Questions** (for exam priority weighting)
   - Format: Structured JSON or CSV
   - Location: `python-backend/data/exams/`
   - Used to determine `examPriority` scores

### Secondary Sources (Student-Uploaded)

Students can upload their own materials (PDFs, images, notes) which are:
- Stored in `uploads/students/{user_id}/documents/`
- Processed using OCR (if images)
- Embedded into a **user-specific** vector namespace
- Used only for that student's RAG queries

---

## Seeding Process

### Step 1: Prepare Curriculum Documents

1. Collect official MOETE textbooks (PDF format)
2. Place in `python-backend/data/curriculum/moete/`
3. Create metadata file:

```json
// python-backend/data/curriculum/metadata.json
{
  "documents": [
    {
      "filename": "grade8_math_textbook.pdf",
      "grade": 8,
      "subject": "Mathematics",
      "authority": "MOETE",
      "language": "ar",
      "academicYear": "2024-2025",
      "chapters": [
        {
          "chapterNumber": 1,
          "title": "Linear Equations",
          "titleAr": "المعادلات الخطية",
          "moeteReference": "G8-M-U1",
          "pageRange": [1, 45]
        }
      ]
    }
  ]
}
```

### Step 2: Run the Seeding Script

Create `python-backend/scripts/seed_knowledge_base.py`:

```python
import os
import json
from pathlib import Path
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from pinecone import Pinecone

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize embedding model
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# Initialize vector database
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

# Text splitter for chunking
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)

def seed_curriculum():
    curriculum_dir = Path("data/curriculum/moete")
    metadata_file = Path("data/curriculum/metadata.json")
    
    with open(metadata_file) as f:
        metadata = json.load(f)
    
    for doc_meta in metadata["documents"]:
        pdf_path = curriculum_dir / doc_meta["filename"]
        print(f"Processing: {pdf_path}")
        
        # Load PDF
        loader = PyPDFLoader(str(pdf_path))
        pages = loader.load()
        
        # Split into chunks
        chunks = text_splitter.split_documents(pages)
        
        # Prepare for embedding
        vectors = []
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = embeddings.embed_query(chunk.page_content)
            
            # Prepare metadata
            chunk_meta = {
                "text": chunk.page_content,
                "grade": doc_meta["grade"],
                "subject": doc_meta["subject"],
                "authority": doc_meta["authority"],
                "filename": doc_meta["filename"],
                "page_number": chunk.metadata.get("page", 0),
                "chunk_index": i,
                "moete_reference": doc_meta.get("moeteReference", "")
            }
            
            vectors.append({
                "id": f"{doc_meta['filename']}_chunk_{i}",
                "values": embedding,
                "metadata": chunk_meta
            })
        
        # Upsert to vector database
        index.upsert(vectors=vectors, namespace="curriculum")
        print(f"✅ Uploaded {len(vectors)} chunks from {doc_meta['filename']}")

if __name__ == "__main__":
    seed_curriculum()
    print("✅ Knowledge base seeding complete!")
```

Run the script:

```bash
cd python-backend
python scripts/seed_knowledge_base.py
```

### Step 3: Verify Vector Database

Check that vectors were uploaded:

```python
# python-backend/scripts/verify_kb.py
from pinecone import Pinecone
import os

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

stats = index.describe_index_stats()
print(f"Total vectors: {stats['total_vector_count']}")
print(f"Namespaces: {stats['namespaces']}")
```

---

## Vector Database Setup

### Option 1: Pinecone (Managed Cloud - Recommended for MVP)

1. Sign up at [pinecone.io](https://www.pinecone.io/)
2. Create a new index:
   - Name: `manhaji-curriculum`
   - Dimensions: `768` (for `text-embedding-004`)
   - Metric: `cosine`
3. Copy API key and environment to `.env`

```bash
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=manhaji-curriculum
```

### Option 2: Qdrant (Self-Hosted)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Update `.env`:
```bash
QDRANT_URL=http://localhost:6333
VECTOR_STORE=qdrant
```

### Option 3: pgvector (PostgreSQL Extension)

If using PostgreSQL as primary database:

```sql
CREATE EXTENSION vector;

CREATE TABLE curriculum_embeddings (
    id TEXT PRIMARY KEY,
    embedding vector(768),
    content TEXT,
    metadata JSONB
);

CREATE INDEX ON curriculum_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## Testing RAG Responses

### Test 1: Basic Query

```bash
curl -X POST http://localhost:8000/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student",
    "grade": 8,
    "subject": "Mathematics",
    "query": "How do I solve simultaneous equations?"
  }'
```

**Expected Response:**
```json
{
  "response": "To solve simultaneous equations, you can use two methods: substitution or elimination...",
  "sources": [
    {
      "filename": "grade8_math_textbook.pdf",
      "page": 45,
      "moeteReference": "G8-M-1.2.1"
    }
  ],
  "confidence": 0.92
}
```

### Test 2: Misconception Detection

```bash
curl -X POST http://localhost:8000/api/notebook/scan \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student",
    "noteContent": "To solve 2x + 3 = 7, I move +3 to the right: 2x = 7 + 3"
  }'
```

**Expected Response:**
```json
{
  "hasMisconception": true,
  "misconceptionType": "Sign Error in Algebraic Manipulation",
  "incorrectStatement": "move +3 to the right: 2x = 7 + 3",
  "correctStatement": "move +3 to the right: 2x = 7 - 3",
  "explanation": "When moving a term across the equals sign, we change its sign. +3 becomes -3.",
  "suggestedResource": "Grade 8 Math, Unit 1, Lesson 1"
}
```

---

## Maintenance & Updates

### Updating Curriculum (New Academic Year)

1. Add new textbooks to `data/curriculum/moete/`
2. Update `metadata.json` with new chapters
3. Re-run seeding script (it will add to existing vectors)

### Monitoring Knowledge Base Quality

Track these metrics:

1. **RAG Recall**: % of queries that retrieve relevant curriculum sections
2. **Citation Accuracy**: % of AI responses that include valid citations
3. **Misconception Detection Rate**: False positives vs. true positives

### Adding New Misconceptions

When a teacher identifies a new common error:

1. Add to `data/misconceptions/common_errors.json`
2. Retrain misconception detection model (if using ML classifier)
3. Update `config/ai-system-prompts.ts` → `COMMON_MISCONCEPTIONS`

---

## Integration with Frontend

The frontend (`services/aiEngineService.ts`) already calls:

```typescript
// Example: Querying with RAG
export async function streamInsight(
  studentId: string,
  grade: number,
  subject: string
): Promise<ReadableStream> {
  const response = await fetch(`${BACKEND_URL}/api/ai/stream-insight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, grade, subject })
  });
  return response.body!;
}
```

The backend must:
1. Load system prompts from `config/ai-system-prompts.ts`
2. Query vector database with student context
3. Construct RAG prompt with retrieved curriculum
4. Stream LLM response with citations

---

## Troubleshooting

### Issue: AI responses are generic (not curriculum-specific)

**Solution**: Verify vector database has curriculum content:
```python
python scripts/verify_kb.py
```

### Issue: No citations in responses

**Solution**: Check RAG pipeline includes `RAG_CITATION_FORMAT` from prompts config.

### Issue: Wrong curriculum content retrieved

**Solution**: Improve metadata tagging. Add more specific `moeteReference` IDs to chunks.

---

## Next Steps

1. ✅ Copy `.env.example` to `.env` and fill in API keys
2. ✅ Run knowledge base seeding script
3. ✅ Test RAG queries
4. ✅ Update `aiEngineService.ts` to use real backend endpoints
5. ✅ Start backend: `cd python-backend && uvicorn main:app --reload`
6. ✅ Test full flow: Frontend → Backend → RAG → LLM → Response

---

## Production Checklist

Before deploying to production:

- [ ] Seed complete MOETE curriculum (all grades, all subjects)
- [ ] Verify all PDF pages processed correctly
- [ ] Set up automatic curriculum updates (academic year rollover)
- [ ] Implement vector database backups
- [ ] Add monitoring for RAG quality metrics
- [ ] Enable rate limiting on expensive AI endpoints
- [ ] Set up error tracking (Sentry) for failed queries
- [ ] Test bilingual support (Arabic/English responses)

---

**Questions?** Refer to:
- `config/ai-system-prompts.ts` - All AI behavior rules
- `config/curriculum-config.ts` - Curriculum structure definition
- `python-backend/config/gemini_rag.py` - RAG implementation
