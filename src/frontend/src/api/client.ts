import axios from "axios";
import type {
  DashboardStats,
  EndpointCreateRequest,
  EndpointList,
  GrafanaConfig,
  InstanceType,
  InferenceEndpoint,
  PodInfo,
  RuntimeCatalog,
  MLModel,
  ModelCreateRequest,
  ModelList,
} from "../types";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Models
export async function fetchModels(
  offset = 0,
  limit = 50,
): Promise<ModelList> {
  const { data } = await api.get<ModelList>("/models", {
    params: { offset, limit },
  });
  return data;
}

export async function createModel(
  payload: ModelCreateRequest,
): Promise<MLModel> {
  const { data } = await api.post<MLModel>("/models", payload);
  return data;
}

export async function fetchModel(id: string): Promise<MLModel> {
  const { data } = await api.get<MLModel>(`/models/${id}`);
  return data;
}

export async function deleteModel(id: string): Promise<void> {
  await api.delete(`/models/${id}`);
}

// Runtimes & instance types
export async function fetchRuntimeCatalog(): Promise<RuntimeCatalog> {
  const { data } = await api.get<RuntimeCatalog>("/endpoints/runtimes");
  return data;
}

export async function fetchInstanceTypes(): Promise<InstanceType[]> {
  const { data } = await api.get<InstanceType[]>("/endpoints/instances");
  return data;
}

// Endpoints
export async function fetchEndpoints(
  offset = 0,
  limit = 50,
): Promise<EndpointList> {
  const { data } = await api.get<EndpointList>("/endpoints", {
    params: { offset, limit },
  });
  return data;
}

export async function createEndpoint(
  payload: EndpointCreateRequest,
): Promise<InferenceEndpoint> {
  const { data } = await api.post<InferenceEndpoint>("/endpoints", payload);
  return data;
}

export async function fetchEndpoint(id: string): Promise<InferenceEndpoint> {
  const { data } = await api.get<InferenceEndpoint>(`/endpoints/${id}`);
  return data;
}

export async function deleteEndpoint(id: string): Promise<void> {
  await api.delete(`/endpoints/${id}`);
}

export async function fetchEndpointPods(id: string): Promise<PodInfo[]> {
  const { data } = await api.get<PodInfo[]>(`/endpoints/${id}/pods`);
  return data;
}

export async function fetchEndpointLogs(
  id: string,
  pod: string,
  tail = 100,
): Promise<string> {
  const { data } = await api.get<{ logs: string }>(`/endpoints/${id}/logs`, {
    params: { pod, tail },
  });
  return data.logs;
}

// Dashboard
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/dashboard/stats");
  return data;
}

// Grafana
export async function fetchGrafanaConfig(): Promise<GrafanaConfig> {
  const { data } = await api.get<GrafanaConfig>("/grafana");
  return data;
}

// Version
export async function fetchVersion(): Promise<string> {
  const { data } = await axios.get<{ version: string }>("/version");
  return data.version;
}
