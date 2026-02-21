ResearchBrief — Multi-Source Research Synthesis

ResearchBrief is a web application that generates a structured research brief from multiple article or document links. Users can paste 5–10 URLs, and the system extracts, cleans, and synthesises the content using an LLM.
How to Run
Development (Manual)

Prerequisites: Python 3.11+, Node.js 18+.

# Clone repository
git clone <repo-url>
cd Aggrosso

# Backend
cd backend
cp .env.example .env
# Add GROQ_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

Docker (One Command)
cp backend/.env.example backend/.env
# Add GROQ_API_KEY
docker-compose up --build
What Is Done

Multi-link article extraction (trafilatura + fallback).

Structured AI research brief:

Summary

Key points with citations

Conflicting claims

Verification checklist

Topic tags

Source transparency and comparison view.

SQLite persistence storing the latest 5 briefs.

REST API using FastAPI.

React frontend with multiple views.

Input validation and basic error handling.

Status page monitoring backend, database, and LLM.

Dockerised local setup.

Hosted and deployed.

What Is Not Done

Authentication and multi-user workflows.

Editing or annotation of briefs.

Export features.

Rate limiting or quotas.

Streaming LLM responses.

PostgreSQL migration.
