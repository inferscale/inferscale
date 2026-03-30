from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from inferscale.db.models import InferenceEndpoint, MLModel


async def get_dashboard_stats(session: AsyncSession) -> dict[str, int]:
    total_models = (await session.execute(select(func.count(MLModel.id)))).scalar_one()

    row = (
        await session.execute(
            select(
                func.count(InferenceEndpoint.id),
                func.count(InferenceEndpoint.id).filter(InferenceEndpoint.status == "Running"),
                func.count(InferenceEndpoint.id).filter(InferenceEndpoint.status == "Failed"),
            )
        )
    ).one()

    return {
        "total_models": total_models,
        "total_endpoints": row[0],
        "active_endpoints": row[1],
        "failed_endpoints": row[2],
    }
