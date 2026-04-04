from pydantic import BaseModel


class GrafanaConfig(BaseModel):
    url: str
    dashboard_uid: str
