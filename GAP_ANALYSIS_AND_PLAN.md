# Manhaji: Product Gap Analysis & Implementation Plan

This document compares the current active codebase against the provided Product Requirements Document (PRD) and Technical Proposal.

## 1. Core Architecture & Tech Stack

| Component | Proposed (PRD) | Current Implementation | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (SSR/SSG) | Vite + React (SPA) | ⚠️ Divergent | Vite was chosen for rapid B2C MVP development. SEO is less critical for a locked platform, but migration to Next.js might be needed for B2B scale later. |
| **Database** | PostgreSQL (Relational) | Firebase Firestore (NoSQL) | ⚠️ Divergent | Firestore enables faster MVP iteration compared to managing a Postgres schema, but complex queries (analytics) may become harder. |
| **Backend Language** | Python (FastAPI) | Python (FastAPI) | ✅ Aligned | The `python-backend` folder structure is set up correctly. |
| **Authentication** | Custom/Firebase | Firebase Auth | ✅ Aligned | Implemented and integrated. |
| **State Management** | Zustand/Redux | React Context + Local State | ⚠️ Partial | `LanguageContext` exists. Global user state is managed in `App.tsx`. Zustand is recommended for complex notebook state. |
| **Styling** | Tailwind CSS | Tailwind CSS | ✅ Aligned | Brand colors (`#00A896`) are correctly implemented. |

## 2. Feature Implementation Status

### 2.1 User Management & Onboarding
*   **PRD Requirement:** Student Sign up, Profile Setup (Grade, Stage, Interest).
*   **Current State:** ✅ Implemented. `SignupPage` and `ProfileSetupPage` are linked and save to Firestore.
*   **Gap:** Parent accounts are not fully distinct yet (using `ParentDashboard` with mock data).

### 2.2 Dashboard & Navigation
*   **PRD Requirement:** "Manhaji" branding, Student Name display, Progress Overview.
*   **Current State:** ✅ Implemented. Dashboard now consumes real user profile data.
*   **Gap:** "Concept Mastery Snapshot" uses mock AI data currently.

### 2.3 AI Tutor & Notebook
*   **PRD Requirement:** Interactive Notebook, RAG (Retrieval Augmented Generation), Mind Maps.
*   **Current State:** ⚠️ Partial.
    *   UI: `AITutor.tsx` exists and replicates the look perfectly.
    *   Logic: RAG backend (`python-backend/services/study_planner.py`) exists but is not fully wired to the frontend `AITutor` component (currently using `setTimeout` mocks).
    *   Mind Maps: React Flow is installed but the "Generate Mind Map" feature is a visual stub in the Chat interface.

### 2.4 Gamification (Ed Games)
*   **PRD Requirement:** Concept Matching, Sequence Ordering, Fix-the-Mistake.
*   **Current State:** ⚠️ UI Only. `GamesPage.tsx` shows the game cards and categories, but the actual games are not playable implementations yet.

### 2.5 Analytics (Parents & Status)
*   **PRD Requirement:** Outcome-focused metrics (Mastery, Time Spent).
*   **Current State:** ✅ `StatusPage.tsx` creates the visualization. Data binding to real backend historical stats is the next step.

## 3. Database Schema Comparison

The proposal suggests a Relational Schema (Users -> Sessions -> Notebooks).
We are currently using a Document Store (Firestore `users` collection).

**Missing Collections (to be created):**
*   `notebooks`: To store the AI chats and notes.
*   `progress`: To store quiz results and mastery levels.
*   `curriculum`: To store the Grade 7-10 Math/Science structure.

## 4. Immediate Recommendations (Next Steps)

1.  **Wire Backend to Frontend:**
    *   Replace `AITutor` mock responses with calls to `http://localhost:8000/api/chat`.
    *   Ensure the Python backend can read the `users` Firestore data or pass the token for verification.

2.  **Implement One Playable Game:**
    *   Choose "Concept Matching" and build a simple interactive component in `GamesPage` to demonstrate the gamification value.

3.  **Parent Dashboard connection:**
    *   Ensure the `ParentDashboard` can read the `student` data from Firestore.

4.  **Deployment:**
    *   The PRD mentions Huawei Cloud. The current setup is local. Dockerfiles are present (`Dockerfile.frontend`, `server/Dockerfile`), putting us in a good position for cloud deployment.
