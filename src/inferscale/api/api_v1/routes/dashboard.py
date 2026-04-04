from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from inferscale.api.deps import get_session
from inferscale.schemas.endpoint import DashboardStats
from inferscale.services import dashboard_service

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    session: AsyncSession = Depends(get_session),
) -> DashboardStats:
    stats = await dashboard_service.get_dashboard_stats(session)
    return DashboardStats(**stats)
