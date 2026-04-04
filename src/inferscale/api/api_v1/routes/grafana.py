from fastapi import APIRouter

from inferscale.config import settings
from inferscale.schemas.grafana import GrafanaConfig

router = APIRouter()


@router.get("", response_model=GrafanaConfig)
async def get_grafana_config() -> GrafanaConfig:
    return GrafanaConfig(
        url=settings.grafana_url,
        dashboard_uid=settings.grafana_dashboard_uid,
    )
