from datetime import datetime
from typing import Any

from pydantic import BaseModel, HttpUrl, field_validator


# ---- Requests ----

class BriefCreateRequest(BaseModel):
    urls: list[str]

    @field_validator("urls")
    @classmethod
    def validate_urls(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("At least one URL is required.")
        if len(v) > 10:
            raise ValueError("A maximum of 10 URLs are allowed.")
        return v


# ---- Sub-schemas ----

class KeyPoint(BaseModel):
    point: str
    source_url: str
    snippet: str


class ConflictingClaim(BaseModel):
    claim_a: str
    source_a: str
    claim_b: str
    source_b: str


class SourceOut(BaseModel):
    id: int
    url: str
    title: str | None
    snippet: str | None

    class Config:
        from_attributes = True


# ---- Responses ----

class BriefListItem(BaseModel):
    id: int
    title: str
    topic_tags: list[str]
    created_at: datetime
    source_count: int

    class Config:
        from_attributes = True


class BriefOut(BaseModel):
    id: int
    title: str
    summary: str
    key_points: list[dict[str, Any]]
    conflicting_claims: list[dict[str, Any]]
    verify_checklist: list[str]
    topic_tags: list[str]
    created_at: datetime
    sources: list[SourceOut]

    class Config:
        from_attributes = True


class HealthOut(BaseModel):
    backend: str
    database: str
    llm: str
