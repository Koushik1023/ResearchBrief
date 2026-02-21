# ResearchBrief — Research Brief from Links

> Paste 5–10 URLs → AI fetches, reads, and synthesises them into a structured research brief.

## Features
- 🔗 Paste up to 10 article/blog/doc URLs
- 🤖 AI-powered brief: summary, key points, conflicting claims, "what to verify" checklist, per-source citations
- 📑 Source page: see exactly what was extracted from each link  
- 💾 Saves & lists your last 5 briefs
- ⇔ Compare sources view — side-by-side attribution table
- 🏷 Topic tags auto-generated per brief
- 🩺 `/status` page — live health of backend, database, and LLM

---

## Tech Stack
| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11) |
| Database | SQLite via SQLAlchemy (async) |
| Content Extraction | trafilatura + BeautifulSoup4 |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Frontend | React 18 + Vite (TypeScript) |

---

## How to Run

### Option 1 — Manual (Development)

**Prerequisites:** Python 3.11+, Node 18+

```bash
# 1. Clone the repo
git clone <repo-url>
cd Aggrosso

# 2. Backend
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
# Opens http://localhost:5173
```

### Option 2 — Docker (One command)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your GROQ_API_KEY

docker-compose up --build
# Backend → http://localhost:8000
# Frontend → http://localhost:5173
```

---

## Environment Variables

### backend/.env
| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (https://console.groq.com) |
| `GROQ_MODEL` | Model name (default: `llama-3.3-70b-versatile`) |
| `DATABASE_URL` | SQLite path (default: `sqlite+aiosqlite:///./briefs.db`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

### frontend/.env
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:8000`) |

---

## What Is Done
- ✅ Link fetching with trafilatura (article-aware) + BS4 fallback
- ✅ Groq LLM brief generation (summary, key points with citations, conflicts, checklist, tags)
- ✅ SQLite persistence — last 5 briefs
- ✅ Full REST API with FastAPI (documented at `/docs`)
- ✅ React SPA with 5 pages: Home, Brief Detail, Saved Briefs, Compare, Status
- ✅ Input validation (URL format, count limits)
- ✅ Error handling for failed fetches & LLM errors
- ✅ Health check endpoint
- ✅ Docker Compose for one-command startup
- ✅ Topic tags + compare view (bonus features)

## What Is Not Done
- ❌ User authentication / multi-user support
- ❌ Brief editing or note-taking
- ❌ PDF export
- ❌ Rate limiting / quota management
- ❌ Streaming LLM response
