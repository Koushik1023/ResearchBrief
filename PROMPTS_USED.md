# Prompts Used for App Development

> Records of key prompts used during development of Research Brief from Links.
> AI responses, API keys, and personal data are excluded.

---

## 1. LLM System Prompt — Research Brief Generation

**Used in:** `backend/services/llm.py`

```
You are a research analyst AI. Given extracted text from multiple web sources, produce a structured research brief in valid JSON.

Return ONLY a JSON object with these exact keys:
{
  "title": "A concise title for the research brief (max 12 words)",
  "summary": "A 2–4 paragraph executive summary synthesising all sources",
  "key_points": [
    {
      "point": "A specific key finding or insight",
      "source_url": "The URL this came from",
      "snippet": "A short verbatim or near-verbatim quote (1–2 sentences) from the source"
    }
  ],
  "conflicting_claims": [
    {
      "topic": "Topic of disagreement",
      "claim_a": "Claim from one source",
      "source_a": "URL of that source",
      "claim_b": "Conflicting claim",
      "source_b": "URL of conflicting source"
    }
  ],
  "verify_checklist": [
    "Thing the reader should independently verify"
  ],
  "topic_tags": ["tag1", "tag2", "tag3"]
}

Rules:
- key_points must have 3–10 items
- conflicting_claims may be an empty list if none exist
- verify_checklist must have 3–7 items
- topic_tags must have 3–6 short lowercase tags
- Return ONLY valid JSON, no markdown fences, no explanation
```

---

## 2. App Architecture Planning

> Used to plan the overall structure and tech stack.

**Prompt:**
```
Build a web app where I can:
* paste 5–10 links (articles, docs, blogs)
* the app fetches and cleans the content of each link
* the app creates a research brief with:
  * summary, key points, conflicting claims, "what to verify" checklist, citations
* show a page that lists each source and what was used from it
* save and view the last 5 research briefs

Stack preferences: FastAPI backend, SQLite, Groq API (llama-3.3-70b-versatile), React + Vite frontend, vanilla CSS dark theme.
```

---

## 3. Content Extraction Strategy

**Prompt:**
```
What is the best approach to extract clean article text from arbitrary URLs in Python?
Compare trafilatura, newspaper3k, and BeautifulSoup. Which is most suitable for a web app
that processes 5–10 diverse URLs (news, blogs, Wikipedia, docs)?
```

> Result: Chose trafilatura as primary (article-aware, no JS required) with BS4 fallback.

---

## 4. Groq JSON Mode Debugging

**Prompt:**
```
My Groq llama-3.3-70b-versatile response sometimes wraps the JSON in ```json fences.
How do I reliably strip them and parse the output?
```

> Result: Added `re.sub` to strip fences before `json.loads`.

---

## 5. SQLAlchemy Async Session Pattern

**Prompt:**
```
Show me the correct FastAPI + SQLAlchemy async pattern for:
- async engine with aiosqlite
- async session as a dependency
- creating tables on startup with lifespan
```
