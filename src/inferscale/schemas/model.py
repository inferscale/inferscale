from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ModelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    model_path: str = Field(min_length=1, max_length=1024)
    description: str | None = None


class ModelResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    name: str
    description: str | None
    model_path: str
    created_at: datetime
    updated_at: datetime
    endpoint_count: int = 0


class ModelList(BaseModel):
    items: list[ModelResponse]
    total: int
