import json
import re

from groq import AsyncGroq

from config import settings

client = AsyncGroq(api_key=settings.groq_api_key)

# Condensed prompt — shorter = less chance of truncation
SYSTEM_PROMPT_V2 = """You are a research analyst. Given web source texts, return a JSON research brief.

Return ONLY valid JSON (no markdown, no extra text) with these exact keys:
{
  "title": "Brief title (max 12 words)",
  "summary": "2-3 paragraph synthesis of all sources",
  "key_points": [
    {"point": "finding", "source_url": "url", "snippet": "1-2 sentence quote"}
  ],
  "conflicting_claims": [
    {"topic": "disagreement topic", "claim_a": "claim", "source_a": "url", "claim_b": "claim", "source_b": "url"}
  ],
  "verify_checklist": ["thing to verify"],
  "topic_tags": ["tag1", "tag2"]
}

Rules: key_points=3-8 items, verify_checklist=3-5 items, topic_tags=3-5 tags, conflicting_claims=[] if none.
CRITICAL: Every string value MUST be wrapped in double quotes. Return ONLY the JSON object."""

SYSTEM_PROMPT = """You are a research analyst AI. Given extracted text from multiple web sources, produce a structured research brief in valid JSON.

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
"""


def _build_user_message(sources: list[dict]) -> str:
    parts = []
    for i, src in enumerate(sources, 1):
        parts.append(f"--- SOURCE {i} ---")
        parts.append(f"URL: {src['url']}")
        if src.get("title"):
            parts.append(f"Title: {src['title']}")
        parts.append(f"Content:\n{src['text'] or '[No content could be extracted]'}")
    return "\n\n".join(parts)


async def generate_brief(sources: list[dict]) -> dict:
    """
    Call Groq LLM with cleaned source texts and return parsed JSON brief.
    Uses JSON mode to force valid output. Falls back to repair on failure.
    """
    user_message = _build_user_message(sources)

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_V2},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
        max_tokens=min(2000 + len(sources) * 600, 4000),  # scale with source count
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()

    # Strip accidental markdown fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```\s*$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to repair common LLM JSON mistakes
        repaired = _repair_json(raw)
        try:
            return json.loads(repaired)
        except json.JSONDecodeError as e:
            raise ValueError(f"LLM returned invalid JSON: {e}\nRaw response: {raw[:500]}")


def _repair_json(raw: str) -> str:
    """Best-effort repair of common LLM JSON mistakes."""
    # Extract just the JSON object if there's surrounding text
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group(0)

    # Fix unquoted string values after a colon: : some text without quotes,
    # e.g. "summary": Some text here,  ->  "summary": "Some text here",
    def quote_unquoted_value(m: re.Match) -> str:
        key = m.group(1)
        val = m.group(2).strip().rstrip(',')
        # skip if it's a number, bool, null, array, or object start
        if val in ('true', 'false', 'null') or re.match(r'^[\d.-]', val) or val.startswith(('{', '[')):
            return m.group(0)
        # Escape any internal double quotes
        val = val.replace('"', "'")
        return f'"{key}": "{val}"'

    raw = re.sub(
        r'"(\w+)":\s*(?!")([^,\[\]{}\n][^,\[\]{}]*?)(?=[,\n}])',
        quote_unquoted_value,
        raw
    )
    return raw


async def check_llm_health() -> bool:
    """Quick ping to verify LLM connection is working."""
    try:
        resp = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": "Reply with: ok"}],
            max_tokens=5,
        )
        return bool(resp.choices[0].message.content)
    except Exception:
        return False
