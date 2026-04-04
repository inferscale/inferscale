import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from inferscale import __version__
from inferscale.api.api_v1.api import api_router
from inferscale.clients.k8s import k8s_client
from inferscale.config import settings
from inferscale.database import async_session_factory, engine
from inferscale.services import task_service

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    background_tasks = [
        asyncio.create_task(
            task_service.status_sync_loop(
                async_session_factory, k8s_client, settings.status_sync_interval
            )
        ),
    ]
    yield
    for t in background_tasks:
        t.cancel()
    await asyncio.gather(*background_tasks, return_exceptions=True)


def create_app() -> FastAPI:
    logging.basicConfig(
        level=logging.DEBUG if settings.debug else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    app = FastAPI(
        title="InferScale",
        version="0.1.0",
        description="A fully automated MLOps platform built to democratize AI/ML infrastructure",
        lifespan=lifespan,
    )

    @app.get("/healthz")
    async def healthz() -> JSONResponse:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return JSONResponse({"status": "ok"})
        except Exception:
            return JSONResponse({"status": "unhealthy"}, status_code=503)

    @app.get("/version")
    async def version() -> JSONResponse:
        return JSONResponse({"version": __version__})

    app.include_router(api_router, prefix="/api/v1")

    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if frontend_dist.exists():
        assets_dir = frontend_dist / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/{path:path}", include_in_schema=False)
        async def serve_spa(path: str) -> FileResponse:
            if path.startswith("api/"):
                return JSONResponse({"detail": "Not Found"}, status_code=404)
            file_path = frontend_dist / path
            if file_path.exists() and file_path.is_file():
                return FileResponse(str(file_path))
            return FileResponse(str(frontend_dist / "index.html"))

    return app
