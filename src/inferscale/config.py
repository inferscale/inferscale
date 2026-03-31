from __future__ import annotations

import enum

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class EndpointStatus(enum.StrEnum):
    CREATING = "Creating"
    PENDING = "Pending"
    RUNNING = "Running"
    FAILED = "Failed"
    DELETING = "Deleting"


class RuntimeCategoryConfig(BaseModel):
    id: str
    label: str
    description: str


COMMON_ARGS = ["--enable_docs_url=True"]


class FrameworkConfig(BaseModel):
    name: str
    label: str
    category: str
    description: str
    model_format: str
    runtime: str
    protocol_version: str | None = None
    default_args: list[str] = COMMON_ARGS


class InstanceTypeConfig(BaseModel):
    name: str
    cpu: str
    memory: str
    gpu: bool = False
    description: str


DEFAULT_RUNTIME_CATEGORIES: list[RuntimeCategoryConfig] = [
    RuntimeCategoryConfig(
        id="predictive",
        label="Predictive AI",
        description="Classical ML models — classification, regression, clustering",
    ),
    RuntimeCategoryConfig(
        id="generative",
        label="Generative AI",
        description="Large Language Models — text generation, chat, embeddings",
    ),
]

DEFAULT_FRAMEWORKS: list[FrameworkConfig] = [
    FrameworkConfig(
        name="sklearn",
        label="Scikit-learn",
        category="predictive",
        description="Serve scikit-learn pipelines and estimators",
        model_format="sklearn",
        runtime="kserve-sklearnserver",
        protocol_version="v2",
    ),
    FrameworkConfig(
        name="lightgbm",
        label="LightGBM",
        category="predictive",
        description="Gradient boosting framework for tabular data",
        model_format="lightgbm",
        runtime="kserve-lgbserver",
        protocol_version="v2",
    ),
    FrameworkConfig(
        name="xgboost",
        label="XGBoost",
        category="predictive",
        description="Scalable gradient boosting for structured data",
        model_format="xgboost",
        runtime="kserve-xgbserver",
        protocol_version="v2",
    ),
    FrameworkConfig(
        name="triton",
        label="Triton Inference Server",
        category="predictive",
        description="NVIDIA Triton for multi-framework model serving",
        model_format="triton",
        runtime="kserve-tritonserver",
    ),
    FrameworkConfig(
        name="huggingface",
        label="HuggingFace",
        category="generative",
        description="Serve Transformers models with HuggingFace",
        model_format="huggingface",
        runtime="kserve-huggingfaceserver",
    ),
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="INFERSCALE_", env_file=".env")

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    db_host: str
    db_port: int = 5432
    db_user: str
    db_password: str
    db_name: str

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    s3_models_bucket: str
    s3_logs_bucket: str

    kserve_namespace: str
    kserve_service_account: str

    grafana_url: str
    grafana_dashboard_uid: str

    status_sync_interval: int

    runtime_categories: list[RuntimeCategoryConfig] = DEFAULT_RUNTIME_CATEGORIES
    frameworks: list[FrameworkConfig] = DEFAULT_FRAMEWORKS
    instance_types: list[InstanceTypeConfig]

    logger_kafka_url: str = ""

    def get_logger_url(self, destination: str) -> str:
        if destination == "kafka":
            if not self.logger_kafka_url:
                raise KeyError("Logger URL not configured for destination: kafka")
            return self.logger_kafka_url
        if destination == "s3":
            if not self.s3_logs_bucket:
                raise KeyError("Logger URL not configured for destination: s3")
            return f"s3://{self.s3_logs_bucket}"
        raise KeyError(f"Unknown logger destination: {destination}")

    def get_framework(self, name: str) -> FrameworkConfig:
        for fw in self.frameworks:
            if fw.name == name:
                return fw
        raise KeyError(f"Unsupported framework: {name}")

    def get_instance_type(self, name: str) -> InstanceTypeConfig:
        for it in self.instance_types:
            if it.name == name:
                return it
        raise KeyError(f"Unknown instance type: {name}")


settings = Settings()
