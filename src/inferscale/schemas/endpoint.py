from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class EndpointCreate(BaseModel):
    model_id: UUID
    name: str = Field(min_length=1, max_length=255)
    runtime: str = Field(min_length=1)
    instance_type: str
    replicas: int = Field(default=1, ge=1, le=10)
    args: list[str] = Field(default_factory=list)
    logger_enabled: bool = False
    logger_mode: str = "all"
    logger_destination: str = "kafka"


class EndpointResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    name: str
    model_id: UUID
    model_name: str = ""
    status: str
    kserve_name: str
    namespace: str
    url: str | None = None
    instance_type: str
    replicas: int
    gpu: bool
    cpu: str
    memory: str
    logger_enabled: bool
    logger_mode: str | None
    logger_destination: str | None
    created_at: datetime


class EndpointList(BaseModel):
    items: list[EndpointResponse]
    total: int


class LogsResponse(BaseModel):
    logs: str


class DashboardStats(BaseModel):
    total_models: int
    total_endpoints: int
    active_endpoints: int
    failed_endpoints: int
