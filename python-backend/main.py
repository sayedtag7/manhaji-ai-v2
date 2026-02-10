"""
Manhaji AI Backend v2 — Egyptian Tutor RAG System
Everything is AI-driven. No static data. Every response is a prompt.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Initialize FastAPI ──────────────────────────────────────────────────────
app = FastAPI(
    title="Manhaji AI Backend",
    description="Egyptian Tutor — AI-Driven Engine for Egyptian MOETE Curriculum. "
    "No static data, everything is a prompt.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3004",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Initialize Core Services ────────────────────────────────────────────────
gemini_api_key = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")

# 1. Vector Store (ChromaDB)
vector_store = None
try:
    from config.vector_db import VectorStore
    vector_store = VectorStore(persist_directory="./data/chroma_db")
    logger.info("✓ Vector Store initialized")
except Exception as e:
    logger.warning(f"⚠ Vector Store init failed (non-critical): {e}")

# 2. RAG System (Gemini)
rag_system = None
try:
    from config.gemini_rag import GeminiRAG
    rag_system = GeminiRAG(vector_store=vector_store, api_key=gemini_api_key)
    logger.info("✓ Gemini RAG initialized")
except Exception as e:
    logger.warning(f"⚠ Gemini RAG init failed: {e}")

# 3. Misconception Detector
misconception_detector = None
try:
    from utils.misconceptions import MisconceptionDetector
    misconception_detector = MisconceptionDetector()
    logger.info("✓ Misconception Detector initialized")
except Exception as e:
    logger.warning(f"⚠ Misconception Detector init failed: {e}")

# 4. Visual Spec Generator (AI-powered)
visual_spec_generator = None
try:
    from utils.visual_specs import VisualSpecGenerator
    visual_spec_generator = VisualSpecGenerator(rag_system=rag_system)
    logger.info("✓ Visual Spec Generator initialized (AI-powered)")
except Exception as e:
    logger.warning(f"⚠ Visual Spec init failed: {e}")

# 5. Study Plan Generator
study_plan_generator = None
try:
    from services.study_planner import StudyPlanGenerator
    study_plan_generator = StudyPlanGenerator(api_key=gemini_api_key)
    logger.info("✓ Study Plan Generator initialized")
except Exception as e:
    logger.warning(f"⚠ Study Planner init failed: {e}")

# 6. Action Engine (the brain)
action_engine = None
try:
    from services.action_engine import ActionEngine
    action_engine = ActionEngine(rag_system=rag_system, vector_store=vector_store)
    logger.info("✓ Action Engine initialized")
except Exception as e:
    logger.warning(f"⚠ Action Engine init failed: {e}")

# 7. Analytics Service (Living Dashboard)
analytics_service = None
try:
    from services.analytics import AnalyticsService
    analytics_service = AnalyticsService()
    logger.info("✓ Analytics Service initialized")
except Exception as e:
    logger.warning(f"⚠ Analytics Service init failed: {e}")

# 7. Load sample data if vector store is empty
if vector_store:
    try:
        from config.sample_data import load_sample_data
        if vector_store.get_stats()["total_documents"] == 0:
            logger.info("Loading sample curriculum data...")
            load_sample_data(vector_store)
    except Exception as e:
        logger.warning(f"⚠ Sample data load failed: {e}")


# ─── Wire Routes ─────────────────────────────────────────────────────────────

# Chat routes (RAG + SSE streaming)
try:
    from routes.chat import router as chat_router, init_chat
    init_chat(rag_system, vector_store, misconception_detector)
    app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
    logger.info("✓ Chat routes mounted")
except Exception as e:
    logger.warning(f"⚠ Chat routes failed: {e}")

# Ingestion routes
try:
    from routes.ingest import router as ingest_router, init_ingest
    init_ingest(vector_store)
    app.include_router(ingest_router, prefix="/api/ingest", tags=["Ingestion"])
    logger.info("✓ Ingest routes mounted")
except Exception as e:
    logger.warning(f"⚠ Ingest routes failed: {e}")

# Study plan routes
try:
    from routes.study_plan import router as sp_router, init_study_planner
    init_study_planner(study_plan_generator)
    app.include_router(sp_router, tags=["Study Plan"])
    logger.info("✓ Study Plan routes mounted")
except Exception as e:
    logger.warning(f"⚠ Study Plan routes failed: {e}")

# Gamification routes
try:
    from routes.gamification import router as gam_router
    app.include_router(gam_router, tags=["Gamification"])
    logger.info("✓ Gamification routes mounted")
except Exception as e:
    logger.warning(f"⚠ Gamification routes failed: {e}")

# Action Engine routes (the core AI-driven endpoints)
try:
    from routes.actions import router as action_router, init_action_engine
    init_action_engine(action_engine, visual_gen=visual_spec_generator)
    app.include_router(action_router, tags=["Actions", "Insights", "Quiz", "Notebook"])
    logger.info("✓ Action Engine routes mounted")
except Exception as e:
    logger.warning(f"⚠ Action Engine routes failed: {e}")

# Analytics routes (Living Dashboard)
try:
    from routes.analytics import router as analytics_router, init_analytics
    init_analytics(analytics_service, rag_system)
    app.include_router(analytics_router, tags=["Analytics"])
    logger.info("✓ Analytics routes mounted")
except Exception as e:
    logger.warning(f"⚠ Analytics routes failed: {e}")


# ─── Legacy query endpoint (kept for backward compatibility) ─────────────────

class QueryRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    lesson_id: Optional[str] = None
    grade: Optional[int] = None
    subject: Optional[str] = None

class QueryResponse(BaseModel):
    text: str
    visual_spec: Optional[Dict[str, Any]] = None
    misconception_flag: bool = False
    misconception_type: Optional[str] = None
    sources: Optional[List[str]] = None
    sentiment: str

@app.post("/api/query", response_model=QueryResponse)
async def query_handler(request: QueryRequest):
    if not rag_system or not vector_store:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    try:
        context, sources = vector_store.retrieve(
            query=request.text, grade=request.grade,
            subject=request.subject, top_k=5
        )
        misconception_flag = False
        misconception_type = None
        if misconception_detector:
            misconception_flag, misconception_type = misconception_detector.detect(
                student_input=request.text, retrieved_context=context
            )
        response_text, sentiment = rag_system.generate_response(
            query=request.text, context=context,
            misconception_flag=misconception_flag,
            misconception_type=misconception_type
        )
        visual_spec = None
        if visual_spec_generator and any(kw in request.text.lower() for kw in ["ارسم", "وضح", "خريطة", "شرح", "رسمة"]):
            visual_spec = visual_spec_generator.generate(
                topic=request.text, context=context, lesson_id=request.lesson_id
            )
        return QueryResponse(
            text=response_text, visual_spec=visual_spec,
            misconception_flag=misconception_flag,
            misconception_type=misconception_type,
            sources=sources, sentiment=sentiment
        )
    except Exception as e:
        logger.error(f"Error in query handler: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Root Endpoints ──────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "منهجي AI Backend v2 — Everything is AI-Driven",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/chat/query",
            "chat_stream": "/api/chat/stream",
            "actions": "/api/actions/decide",
            "learning_path": "/api/actions/learning-path",
            "dynamic_button": "/api/actions/dynamic-button",
            "insights": "/api/insights/generate",
            "insights_stream": "/api/insights/stream",
            "socratic_quiz": "/api/quiz/socratic",
            "teach_ai": "/api/quiz/evaluate-reasoning",
            "notebook_scan": "/api/notebook/scan",
            "study_plan": "/api/study-plan/generate",
            "gamification": "/api/gamification/profile",
            "parent_report": "/api/parent/report",
        },
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "vector_store": "active" if vector_store else "inactive",
            "gemini_rag": "active" if rag_system else "inactive",
            "action_engine": "active" if action_engine else "inactive",
            "study_planner": "active" if study_plan_generator else "inactive",
            "misconception_detector": "active" if misconception_detector else "inactive",
            "analytics": "active" if analytics_service else "inactive",
        },
    }

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Manhaji AI Backend v2 Started — Everything is AI-Driven")
    if vector_store:
        stats = vector_store.get_stats()
        logger.info(f"📚 Vector Store: {stats['total_documents']} documents loaded")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
