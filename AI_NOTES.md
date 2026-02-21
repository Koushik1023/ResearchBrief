# AI Notes

## What I Used AI For

This project was built with assistance from an AI coding assistant (Google Deepmind Antigravity). Here's a transparent breakdown:

### AI-assisted
- **LLM prompt design**: The system prompt in `backend/services/llm.py` was iteratively designed to reliably produce structured JSON with key_points, conflicting_claims, verify_checklist, and topic_tags.
- **FastAPI boilerplate**: Initial scaffolding of the router structure and lifespan pattern.
- **CSS design system**: The dark theme token palette and card/animation patterns.
- **Pydantic schema structure**: The nested response models.

### Manually Reviewed and Verified
- **trafilatura integration**: Verified that article extraction actually works on real pages (Wikipedia, news sites, blogs) and the BS4 fallback triggers correctly for paywalled/JS-heavy pages.
- **Groq JSON parse robustness**: Added regex to strip accidental markdown fences from LLM output — a real edge case I caught during testing.
- **CORS configuration**: Manually verified the middleware config allows the Vite dev server to call the backend.
- **Async SQLAlchemy session management**: Confirmed the `get_db` dependency correctly yields and disposes sessions.
- **URL validation logic**: Wrote the frontend validator myself using the `URL` constructor — a more reliable approach than regex.
- **All routing logic**: The React Router setup and page transitions.

## LLM & Provider

**Provider:** [Groq](https://console.groq.com)  
**Model:** `llama-3.3-70b-versatile`

**Why Groq?**
- Groq's LPU (Language Processing Unit) hardware provides sub-second latency for large models, which matters for a research app where users wait for results.
- `llama-3.3-70b-versatile` has excellent instruction-following for structured JSON output, a large context window suitable for multi-document synthesis, and a generous free tier.
- The Python SDK (`groq`) is well-maintained and supports async.

**Why not OpenAI/Gemini?**
- Groq's free tier is more accessible for demos/submissions with no credit card requirement.
- Lower latency means a noticeably snappier user experience.
