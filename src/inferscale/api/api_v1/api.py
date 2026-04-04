from fastapi import APIRouter

from inferscale.api.api_v1.routes import dashboard, endpoints, grafana, models

api_router = APIRouter()
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(endpoints.router, prefix="/endpoints", tags=["endpoints"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(grafana.router, prefix="/grafana", tags=["grafana"])
