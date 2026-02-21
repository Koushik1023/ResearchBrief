from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import get_db
from schemas import HealthOut
from services.llm import check_llm_health

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthOut)
async def health_check(db: AsyncSession = Depends(get_db)):
    # Backend is up if we reach here
    backend_status = "ok"

    # Database check
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"

    # LLM check
    llm_ok = await check_llm_health()
    llm_status = "ok" if llm_ok else "error"

    return HealthOut(backend=backend_status, database=db_status, llm=llm_status)
