import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Brief, Source
from schemas import BriefCreateRequest, BriefListItem, BriefOut, SourceOut
from services.fetcher import fetch_and_clean
from services.llm import generate_brief

router = APIRouter(prefix="/api/briefs", tags=["briefs"])


@router.post("", response_model=BriefOut, status_code=status.HTTP_201_CREATED)
async def create_brief(payload: BriefCreateRequest, db: AsyncSession = Depends(get_db)):
    """
    Accept a list of URLs, fetch & clean their content, call the LLM,
    persist the brief, and return it.
    """
    if not payload.urls:
        raise HTTPException(status_code=422, detail="At least one URL is required.")

    # --- Fetch all URLs concurrently ---
    fetched = await asyncio.gather(*[fetch_and_clean(url) for url in payload.urls])

    # Filter out complete failures (no text AND has an error)
    successful = [f for f in fetched if f.get("text")]
    if not successful:
        raise HTTPException(
            status_code=422,
            detail="Could not extract content from any of the provided URLs. "
                   "Please check that they are publicly accessible article/blog/doc pages.",
        )

    # --- Generate brief via LLM ---
    try:
        brief_data = await generate_brief(successful)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    # --- Persist to DB ---
    brief = Brief(
        title=brief_data.get("title", "Research Brief"),
        summary=brief_data.get("summary", ""),
        key_points=json.dumps(brief_data.get("key_points", [])),
        conflicting_claims=json.dumps(brief_data.get("conflicting_claims", [])),
        verify_checklist=json.dumps(brief_data.get("verify_checklist", [])),
        topic_tags=json.dumps(brief_data.get("topic_tags", [])),
    )
    db.add(brief)
    await db.flush()  # get ID before adding sources

    for src in fetched:
        source = Source(
            brief_id=brief.id,
            url=src["url"],
            title=src.get("title"),
            snippet=_pick_snippet(src.get("text"), brief_data),
            full_text=src.get("text", ""),
        )
        db.add(source)

    await db.commit()
    await db.refresh(brief)

    # Eagerly load sources
    result = await db.execute(
        select(Brief).where(Brief.id == brief.id)
    )
    brief = result.scalar_one()
    sources_result = await db.execute(select(Source).where(Source.brief_id == brief.id))
    sources = sources_result.scalars().all()

    return _brief_to_out(brief, sources)


@router.get("", response_model=list[BriefListItem])
async def list_briefs(db: AsyncSession = Depends(get_db)):
    """Return the last 5 briefs (most recent first)."""
    result = await db.execute(
        select(Brief).order_by(Brief.created_at.desc()).limit(5)
    )
    briefs = result.scalars().all()
    items = []
    for b in briefs:
        # Count sources
        cnt_result = await db.execute(
            select(func.count()).where(Source.brief_id == b.id)
        )
        count = cnt_result.scalar_one()
        items.append(BriefListItem(
            id=b.id,
            title=b.title,
            topic_tags=json.loads(b.topic_tags),
            created_at=b.created_at,
            source_count=count,
        ))
    return items


@router.get("/{brief_id}", response_model=BriefOut)
async def get_brief(brief_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single brief with full detail."""
    result = await db.execute(select(Brief).where(Brief.id == brief_id))
    brief = result.scalar_one_or_none()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found.")

    src_result = await db.execute(select(Source).where(Source.brief_id == brief_id))
    sources = src_result.scalars().all()

    return _brief_to_out(brief, sources)


# ---- Helpers ----

def _pick_snippet(text: str | None, brief_data: dict) -> str | None:
    """Try to find a matching snippet from key_points for this source."""
    if not text:
        return None
    # Return first 300 chars as fallback snippet
    return text[:300]


def _brief_to_out(brief: Brief, sources: list) -> BriefOut:
    return BriefOut(
        id=brief.id,
        title=brief.title,
        summary=brief.summary,
        key_points=json.loads(brief.key_points),
        conflicting_claims=json.loads(brief.conflicting_claims),
        verify_checklist=json.loads(brief.verify_checklist),
        topic_tags=json.loads(brief.topic_tags),
        created_at=brief.created_at,
        sources=[
            SourceOut(id=s.id, url=s.url, title=s.title, snippet=s.snippet)
            for s in sources
        ],
    )
