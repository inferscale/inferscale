from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from inferscale.api.deps import get_session
from inferscale.schemas.model import ModelCreate, ModelList, ModelResponse
from inferscale.services import model_service

router = APIRouter()


@router.get("", response_model=ModelList)
async def list_models(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> ModelList:
    models, total = await model_service.list_models(session, offset=offset, limit=limit)
    items = []
    for m in models:
        resp = ModelResponse.model_validate(m)
        resp.endpoint_count = len(m.endpoints)
        items.append(resp)
    return ModelList(items=items, total=total)


@router.post("", response_model=ModelResponse, status_code=201)
async def create_model(
    data: ModelCreate,
    session: AsyncSession = Depends(get_session),
) -> ModelResponse:
    existing = await model_service.get_model_by_name(session, data.name)
    if existing:
        raise HTTPException(status_code=409, detail=f"Model '{data.name}' already exists")

    model = await model_service.create_model(session, data)
    resp = ModelResponse.model_validate(model)
    resp.endpoint_count = 0
    return resp


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> ModelResponse:
    model = await model_service.get_model(session, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    resp = ModelResponse.model_validate(model)
    resp.endpoint_count = len(model.endpoints)
    return resp


@router.delete("/{model_id}", status_code=204)
async def delete_model(
    model_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    model = await model_service.get_model(session, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    try:
        await model_service.delete_model(session, model_id)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
