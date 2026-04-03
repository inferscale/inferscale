from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from inferscale.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=3600,
)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)
