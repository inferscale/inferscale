import asyncio
import logging

from sqlalchemy.ext.asyncio import async_sessionmaker

from inferscale.clients.k8s import K8sClient
from inferscale.services import endpoint_service

logger = logging.getLogger(__name__)


async def status_sync_loop(
    session_factory: async_sessionmaker,
    k8s: K8sClient,
    interval: float,
) -> None:
    while True:
        await asyncio.sleep(interval)
        try:
            async with session_factory() as session:
                endpoints = await endpoint_service.list_active_endpoints(session)
                if endpoints:
                    await endpoint_service.refresh_statuses(k8s, endpoints)
                    await session.commit()
        except Exception:
            logger.warning("Status sync failed", exc_info=True)
