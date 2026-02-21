import json
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Brief(Base):
    __tablename__ = "briefs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, default="Research Brief")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_points: Mapped[str] = mapped_column(Text, nullable=False)       # JSON list
    conflicting_claims: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list
    verify_checklist: Mapped[str] = mapped_column(Text, nullable=False)    # JSON list
    topic_tags: Mapped[str] = mapped_column(Text, nullable=False)          # JSON list
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    sources: Mapped[list["Source"]] = relationship(
        "Source", back_populates="brief", cascade="all, delete-orphan"
    )

    # ---- convenience helpers ----
    def key_points_list(self) -> list:
        return json.loads(self.key_points)

    def conflicting_claims_list(self) -> list:
        return json.loads(self.conflicting_claims)

    def verify_checklist_list(self) -> list:
        return json.loads(self.verify_checklist)

    def topic_tags_list(self) -> list:
        return json.loads(self.topic_tags)


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brief_id: Mapped[int] = mapped_column(ForeignKey("briefs.id"), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=True)
    snippet: Mapped[str] = mapped_column(Text, nullable=True)   # extract used in brief
    full_text: Mapped[str] = mapped_column(Text, nullable=True) # cleaned full text

    brief: Mapped["Brief"] = relationship("Brief", back_populates="sources")
