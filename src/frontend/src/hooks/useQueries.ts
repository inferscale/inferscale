import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEndpoint,
  createModel,
  deleteEndpoint,
  deleteModel,
  fetchDashboardStats,
  fetchEndpoint,
  fetchEndpoints,
  fetchEndpointLogs,
  fetchEndpointPods,
  fetchGrafanaConfig,
  fetchInstanceTypes,
  fetchRuntimeCatalog,
  fetchModel,
  fetchModels,
  fetchVersion,
} from "../api/client";
import type { EndpointCreateRequest, ModelCreateRequest } from "../types";

const PAGE_SIZE = 10;

export { PAGE_SIZE };

export function useModels(page = 0) {
  return useQuery({
    queryKey: ["models", page],
    queryFn: () => fetchModels(page * PAGE_SIZE, PAGE_SIZE),
  });
}

export function useModel(id: string) {
  return useQuery({
    queryKey: ["models", id],
    queryFn: () => fetchModel(id),
    enabled: !!id,
  });
}

export function useEndpoints(page = 0) {
  return useQuery({
    queryKey: ["endpoints", page],
    queryFn: () => fetchEndpoints(page * PAGE_SIZE, PAGE_SIZE),
  });
}

export function useEndpoint(id: string) {
  return useQuery({
    queryKey: ["endpoints", id],
    queryFn: () => fetchEndpoint(id),
    enabled: !!id,
  });
}

export function useEndpointPods(id: string, enabled = true) {
  return useQuery({
    queryKey: ["endpoint-pods", id],
    queryFn: () => fetchEndpointPods(id),
    enabled: !!id && enabled,
  });
}

export function useEndpointLogs(id: string, pod: string, tail: number, enabled = true) {
  return useQuery({
    queryKey: ["endpoint-logs", id, pod, tail],
    queryFn: () => fetchEndpointLogs(id, pod, tail),
    enabled: !!id && !!pod && enabled,
    refetchInterval: 10_000,
  });
}

export function useRuntimeCatalog() {
  return useQuery({
    queryKey: ["runtime-catalog"],
    queryFn: fetchRuntimeCatalog,
    staleTime: 5 * 60 * 1000,
  });
}


export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useCreateModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ModelCreateRequest) => createModel(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useCreateEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EndpointCreateRequest) => createEndpoint(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["endpoints"] });
      qc.invalidateQueries({ queryKey: ["models"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEndpoint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["endpoints"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useGrafanaConfig() {
  return useQuery({
    queryKey: ["grafana-config"],
    queryFn: fetchGrafanaConfig,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInstanceTypes() {
  return useQuery({
    queryKey: ["instance-types"],
    queryFn: fetchInstanceTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: fetchVersion,
    staleTime: 10 * 60 * 1000,
  });
}
