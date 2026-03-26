from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from inferscale.db.base import Base


class MLModel(Base):
    __tablename__ = "ml_models"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(default=None)
    model_path: Mapped[str] = mapped_column(String(1024))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    endpoints: Mapped[list[InferenceEndpoint]] = relationship(back_populates="model")


class InferenceEndpoint(Base):
    __tablename__ = "inference_endpoints"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_models.id", ondelete="RESTRICT"))
    runtime: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="Creating")
    kserve_name: Mapped[str] = mapped_column(String(255))
    namespace: Mapped[str] = mapped_column(String(255))
    instance_type: Mapped[str] = mapped_column(String(50), default="ml.small")
    replicas: Mapped[int] = mapped_column(default=1)
    gpu: Mapped[bool] = mapped_column(default=False)
    cpu: Mapped[str] = mapped_column(String(20), default="1")
    memory: Mapped[str] = mapped_column(String(20), default="2Gi")
    logger_enabled: Mapped[bool] = mapped_column(default=False)
    logger_mode: Mapped[str | None] = mapped_column(String(20), default=None)
    logger_destination: Mapped[str | None] = mapped_column(String(20), default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    model: Mapped[MLModel] = relationship(back_populates="endpoints")
