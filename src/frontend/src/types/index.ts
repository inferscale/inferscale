export interface MLModel {
  id: string;
  name: string;
  description: string | null;
  model_path: string;
  created_at: string;
  updated_at: string;
  endpoint_count: number;
}

export interface ModelList {
  items: MLModel[];
  total: number;
}

export interface ModelCreateRequest {
  name: string;
  model_path: string;
  description?: string;
}

export interface RuntimeCategory {
  id: string;
  label: string;
  description: string;
}

export interface RuntimeInfo {
  name: string;
  label: string;
  category: string;
  description: string;
}

export interface RuntimeCatalog {
  categories: RuntimeCategory[];
  items: RuntimeInfo[];
}

export interface InstanceType {
  name: string;
  cpu: string;
  memory: string;
  gpu: boolean;
  description: string;
}

export type EndpointStatus = "Running" | "Pending" | "Creating" | "Deleting" | "Failed";

export interface InferenceEndpoint {
  id: string;
  name: string;
  model_id: string;
  model_name: string;
  status: EndpointStatus;
  kserve_name: string;
  namespace: string;
  url: string | null;
  instance_type: string;
  replicas: number;
  gpu: boolean;
  cpu: string;
  memory: string;
  logger_enabled: boolean;
  logger_mode: string | null;
  logger_destination: string | null;
  created_at: string;
}

export interface EndpointList {
  items: InferenceEndpoint[];
  total: number;
}

export interface EndpointCreateRequest {
  model_id: string;
  name: string;
  runtime: string;
  instance_type: string;
  replicas: number;
  args: string[];
  logger_enabled: boolean;
  logger_mode: string;
  logger_destination: string;
}

export interface PodInfo {
  name: string;
  status: string;
}

export interface DashboardStats {
  total_models: number;
  total_endpoints: number;
  active_endpoints: number;
  failed_endpoints: number;
}

export interface GrafanaConfig {
  url: string;
  dashboard_uid: string;
}
