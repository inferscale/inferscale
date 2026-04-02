import asyncio
import logging
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from inferscale.config import EndpointStatus, settings
from inferscale.db.models import InferenceEndpoint, MLModel
from inferscale.services import predictive_service

logger = logging.getLogger(__name__)


async def create_endpoint(
    session: AsyncSession,
    *,
    name: str,
    model: MLModel,
    runtime: str,
    instance_type: str,
    replicas: int,
    args: list[str],
    logger_enabled: bool = False,
    logger_mode: str = "all",
    logger_destination: str = "kafka",
) -> InferenceEndpoint:
    existing = await session.execute(
        select(InferenceEndpoint).where(InferenceEndpoint.name == name)
    )
    if existing.scalar_one_or_none():
        raise ValueError(f"Endpoint '{name}' already exists")

    settings.get_framework(runtime)
    itype = settings.get_instance_type(instance_type)

    logger_url = None
    if logger_enabled:
        logger_url = settings.get_logger_url(logger_destination)

    kserve_name = name.lower().replace(" ", "-")
    namespace = settings.kserve_namespace

    await predictive_service.create_inference_service(
        name=kserve_name,
        framework=runtime,
        storage_uri=model.model_path,
        namespace=namespace,
        replicas=replicas,
        gpu=itype.gpu,
        cpu=itype.cpu,
        memory=itype.memory,
        extra_args=args,
        logger_url=logger_url,
        logger_mode=logger_mode,
    )

    endpoint = InferenceEndpoint(
        name=name,
        model_id=model.id,
        runtime=runtime,
        kserve_name=kserve_name,
        namespace=namespace,
        status=EndpointStatus.CREATING,
        instance_type=instance_type,
        replicas=replicas,
        gpu=itype.gpu,
        cpu=itype.cpu,
        memory=itype.memory,
        logger_enabled=logger_enabled,
        logger_mode=logger_mode if logger_enabled else None,
        logger_destination=logger_destination if logger_enabled else None,
    )
    session.add(endpoint)
    await session.commit()
    await session.refresh(endpoint, attribute_names=["model"])
    return endpoint


async def list_endpoints(
    session: AsyncSession, offset: int = 0, limit: int = 50
) -> tuple[list[InferenceEndpoint], int]:
    total = (await session.execute(select(func.count(InferenceEndpoint.id)))).scalar_one()

    result = await session.execute(
        select(InferenceEndpoint)
        .options(selectinload(InferenceEndpoint.model))
        .order_by(InferenceEndpoint.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all()), total


async def list_active_endpoints(session: AsyncSession) -> list[InferenceEndpoint]:
    result = await session.execute(
        select(InferenceEndpoint).where(
            InferenceEndpoint.status.in_(
                [
                    EndpointStatus.CREATING,
                    EndpointStatus.PENDING,
                    EndpointStatus.RUNNING,
                    EndpointStatus.DELETING,
                ]
            )
        )
    )
    return list(result.scalars().all())


async def get_endpoint(session: AsyncSession, endpoint_id: UUID) -> InferenceEndpoint | None:
    result = await session.execute(
        select(InferenceEndpoint)
        .options(selectinload(InferenceEndpoint.model))
        .where(InferenceEndpoint.id == endpoint_id)
    )
    return result.scalar_one_or_none()


async def refresh_status(endpoint: InferenceEndpoint) -> str | None:
    try:
        k8s_status = await predictive_service.get_inference_service_status(
            endpoint.kserve_name, endpoint.namespace
        )
        endpoint.status = k8s_status["status"].value
        return k8s_status["url"]
    except Exception:
        logger.warning("Could not refresh status for endpoint %s", endpoint.name, exc_info=True)
        return None


async def refresh_statuses(
    endpoints: list[InferenceEndpoint],
) -> dict[str, str | None]:
    url_map: dict[str, str | None] = {}
    if not endpoints:
        return url_map

    results = await asyncio.gather(
        *(
            predictive_service.get_inference_service_status(ep.kserve_name, ep.namespace)
            for ep in endpoints
        ),
        return_exceptions=True,
    )
    for ep, result in zip(endpoints, results):
        if isinstance(result, Exception):
            logger.warning("Could not refresh status for endpoint %s", ep.name, exc_info=result)
            continue
        ep.status = result["status"].value
        url_map[str(ep.id)] = result["url"]

    return url_map


async def delete_endpoint(session: AsyncSession, endpoint: InferenceEndpoint) -> None:
    previous_status = endpoint.status
    endpoint.status = EndpointStatus.DELETING
    await session.commit()

    try:
        await predictive_service.delete_inference_service(endpoint.kserve_name, endpoint.namespace)
    except Exception:
        endpoint.status = previous_status
        await session.commit()
        raise

    await session.delete(endpoint)
    await session.commit()
