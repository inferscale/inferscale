from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from inferscale.db.models import MLModel
from inferscale.schemas.model import ModelCreate


async def list_models(
    session: AsyncSession, offset: int = 0, limit: int = 50
) -> tuple[list[MLModel], int]:
    count_result = await session.execute(select(func.count(MLModel.id)))
    total = count_result.scalar_one()

    result = await session.execute(
        select(MLModel)
        .options(selectinload(MLModel.endpoints))
        .order_by(MLModel.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    models = list(result.scalars().all())
    return models, total


async def get_model(session: AsyncSession, model_id: UUID) -> MLModel | None:
    result = await session.execute(
        select(MLModel).options(selectinload(MLModel.endpoints)).where(MLModel.id == model_id)
    )
    return result.scalar_one_or_none()


async def get_model_by_name(session: AsyncSession, name: str) -> MLModel | None:
    result = await session.execute(select(MLModel).where(MLModel.name == name))
    return result.scalar_one_or_none()


async def create_model(session: AsyncSession, data: ModelCreate) -> MLModel:
    model = MLModel(
        name=data.name,
        model_path=data.model_path,
        description=data.description,
    )
    session.add(model)
    await session.commit()
    await session.refresh(model, attribute_names=["endpoints"])
    return model


async def delete_model(session: AsyncSession, model_id: UUID) -> bool:
    model = await get_model(session, model_id)
    if model is None:
        return False

    active = [e for e in model.endpoints if e.status not in ("Deleting",)]
    if active:
        raise ValueError("Cannot delete model with active endpoints")

    await session.delete(model)
    await session.commit()
    return True
