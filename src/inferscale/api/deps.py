from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from inferscale.clients.k8s import K8sClient, k8s_client
from inferscale.database import async_session_factory


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


def get_k8s_client() -> K8sClient:
    return k8s_client
