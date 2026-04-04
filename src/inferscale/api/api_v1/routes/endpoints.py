import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from inferscale.api.deps import get_k8s_client, get_session
from inferscale.clients.k8s import K8sClient, K8sClientError
from inferscale.config import settings
from inferscale.db.models import InferenceEndpoint, MLModel
from inferscale.schemas.endpoint import EndpointCreate, EndpointList, EndpointResponse, LogsResponse
from inferscale.services import endpoint_service, predictive_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _to_response(ep: InferenceEndpoint, url: str | None = None) -> EndpointResponse:
    resp = EndpointResponse.model_validate(ep)
    resp.url = url
    if ep.model:
        resp.model_name = ep.model.name
    return resp


@router.get("/instances")
async def list_instance_types() -> list[dict]:
    return [it.model_dump() for it in settings.instance_types]


@router.get("/runtimes")
async def list_runtimes() -> dict:
    return {
        "categories": [cat.model_dump() for cat in settings.runtime_categories],
        "items": [
            {
                "name": fw.name,
                "label": fw.label,
                "category": fw.category,
                "description": fw.description,
            }
            for fw in settings.frameworks
        ],
    }


@router.post("", response_model=EndpointResponse, status_code=201)
async def create_endpoint(
    data: EndpointCreate,
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> EndpointResponse:
    from sqlalchemy import select

    result = await session.execute(select(MLModel).where(MLModel.id == data.model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    try:
        endpoint = await endpoint_service.create_endpoint(
            session,
            k8s,
            name=data.name,
            model=model,
            runtime=data.runtime,
            instance_type=data.instance_type,
            replicas=data.replicas,
            args=data.args,
            logger_enabled=data.logger_enabled,
            logger_mode=data.logger_mode,
            logger_destination=data.logger_destination,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except K8sClientError as exc:
        logger.exception("Failed to create InferenceService")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create KServe InferenceService: {exc.message}",
        ) from exc

    return _to_response(endpoint)


@router.get("", response_model=EndpointList)
async def list_endpoints(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> EndpointList:
    endpoints, total = await endpoint_service.list_endpoints(session, offset, limit)

    url_map = await endpoint_service.refresh_statuses(k8s, endpoints)
    if endpoints:
        await session.commit()

    items = [_to_response(ep, url=url_map.get(str(ep.id))) for ep in endpoints]
    return EndpointList(items=items, total=total)


@router.get("/{endpoint_id}", response_model=EndpointResponse)
async def get_endpoint(
    endpoint_id: UUID,
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> EndpointResponse:
    endpoint = await endpoint_service.get_endpoint(session, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    url = await endpoint_service.refresh_status(k8s, endpoint)
    await session.commit()

    return _to_response(endpoint, url=url)


@router.get("/{endpoint_id}/pods")
async def list_endpoint_pods(
    endpoint_id: UUID,
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> list[dict[str, str]]:
    endpoint = await endpoint_service.get_endpoint(session, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    return await predictive_service.list_predictor_pods(
        k8s, endpoint.kserve_name, endpoint.namespace
    )


@router.get("/{endpoint_id}/logs", response_model=LogsResponse)
async def get_endpoint_logs(
    endpoint_id: UUID,
    pod: str = Query(..., description="Pod name to fetch logs from"),
    tail: int = Query(100, ge=1, le=5000),
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> LogsResponse:
    endpoint = await endpoint_service.get_endpoint(session, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    logs = await predictive_service.get_pod_logs(k8s, pod, endpoint.namespace, tail_lines=tail)
    return LogsResponse(logs=logs)


@router.delete("/{endpoint_id}", status_code=204)
async def delete_endpoint(
    endpoint_id: UUID,
    session: AsyncSession = Depends(get_session),
    k8s: K8sClient = Depends(get_k8s_client),
) -> None:
    endpoint = await endpoint_service.get_endpoint(session, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    try:
        await endpoint_service.delete_endpoint(session, k8s, endpoint)
    except K8sClientError as exc:
        logger.exception("Failed to delete InferenceService %s", endpoint.kserve_name)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to delete KServe InferenceService: {exc.message}",
        ) from exc
