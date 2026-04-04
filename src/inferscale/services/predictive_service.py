import logging
from typing import Any

from inferscale.clients.k8s import K8sClient
from inferscale.config import EndpointStatus, FrameworkConfig, settings

logger = logging.getLogger(__name__)


def _build_model_spec(
    fw: FrameworkConfig,
    storage_uri: str,
    resources: dict[str, Any],
    extra_args: list[str],
) -> dict[str, Any]:
    args = [*fw.default_args, *extra_args]

    spec: dict[str, Any] = {
        "modelFormat": {"name": fw.model_format},
        "runtime": fw.runtime,
        "storageUri": storage_uri,
        "args": args,
        "resources": resources,
    }
    if fw.protocol_version:
        spec["protocolVersion"] = fw.protocol_version
    return spec


def _build_resources(cpu: str, memory: str, gpu: bool) -> dict[str, Any]:
    resources: dict[str, Any] = {
        "requests": {"cpu": cpu, "memory": memory},
        "limits": {"cpu": cpu, "memory": memory},
    }
    if gpu:
        resources["limits"]["nvidia.com/gpu"] = "1"
    return resources


def _parse_status(obj: dict[str, Any]) -> dict[str, Any]:
    metadata = obj.get("metadata", {})
    if metadata.get("deletionTimestamp"):
        return {"status": EndpointStatus.DELETING, "url": None}

    status_block = obj.get("status", {})
    url = status_block.get("url") or status_block.get("address", {}).get("url")

    model_status = status_block.get("modelStatus", {})
    model_state = model_status.get("states", {}).get("activeModelState", "")
    failed_copies = model_status.get("copies", {}).get("failedCopies", 0)

    if model_state == "FailedToLoad" or failed_copies > 0:
        return {"status": EndpointStatus.FAILED, "url": url}

    conditions = status_block.get("conditions", [])
    ready_condition = next((c for c in conditions if c.get("type") == "Ready"), None)

    if ready_condition and ready_condition.get("status") == "True":
        return {"status": EndpointStatus.RUNNING, "url": url}

    if ready_condition:
        reason = (ready_condition.get("reason") or "").lower()
        message = (ready_condition.get("message") or "").lower()
        if "insufficient" in reason or "insufficient" in message:
            return {"status": EndpointStatus.PENDING, "url": None}

    return {"status": EndpointStatus.CREATING, "url": None}


async def create_inference_service(
    k8s: K8sClient,
    name: str,
    framework: str,
    storage_uri: str,
    namespace: str,
    replicas: int = 1,
    gpu: bool = False,
    cpu: str = "1",
    memory: str = "2Gi",
    extra_args: list[str] | None = None,
    logger_url: str | None = None,
    logger_mode: str = "all",
) -> dict[str, Any]:
    fw = settings.get_framework(framework)
    resources = _build_resources(cpu, memory, gpu)
    model_spec = _build_model_spec(fw, storage_uri, resources, extra_args or [])

    annotations: dict[str, str] = {
        "serving.kserve.io/autoscalerClass": "none",
        "serving.kserve.io/enable-prometheus-scraping": "true",
    }

    predictor: dict[str, Any] = {
        "serviceAccountName": settings.kserve_service_account,
        "minReplicas": replicas,
        "maxReplicas": replicas,
        "model": model_spec,
    }
    if logger_url:
        logger_spec: dict[str, Any] = {"mode": logger_mode, "url": logger_url}
        if logger_url.startswith("s3://"):
            logger_spec["storage"] = {
                "path": "/logs",
                "parameters": {"type": "s3", "format": "json"},
                "key": "s3-credentials",
            }
        predictor["logger"] = logger_spec

    body = {
        "apiVersion": f"{settings.kserve_group}/{settings.kserve_version}",
        "kind": "InferenceService",
        "metadata": {
            "name": name,
            "namespace": namespace,
            "annotations": annotations,
        },
        "spec": {
            "predictor": predictor,
        },
    }

    result = await k8s.create_custom_object(
        settings.kserve_group, settings.kserve_version, namespace, settings.kserve_plural, body
    )
    logger.info("Created InferenceService %s in namespace %s", name, namespace)
    return result


async def get_inference_service_status(k8s: K8sClient, name: str, namespace: str) -> dict[str, Any]:
    obj = await k8s.get_custom_object(
        settings.kserve_group, settings.kserve_version, namespace, settings.kserve_plural, name
    )
    if obj is None:
        return {"status": EndpointStatus.CREATING, "url": None}

    result = _parse_status(obj)

    if result["status"] in (EndpointStatus.PENDING, EndpointStatus.CREATING):
        label = f"serving.kserve.io/inferenceservice={name}"
        if await k8s.has_crashed_pods(namespace, label):
            return {"status": EndpointStatus.FAILED, "url": None}

    return result


async def delete_inference_service(k8s: K8sClient, name: str, namespace: str) -> bool:
    deleted = await k8s.delete_custom_object(
        settings.kserve_group, settings.kserve_version, namespace, settings.kserve_plural, name
    )
    if deleted:
        logger.info("Deleted InferenceService %s from namespace %s", name, namespace)
    return deleted


async def list_predictor_pods(k8s: K8sClient, name: str, namespace: str) -> list[dict[str, str]]:
    return await k8s.list_pods(
        namespace, label_selector=f"serving.kserve.io/inferenceservice={name}"
    )


async def get_pod_logs(k8s: K8sClient, pod_name: str, namespace: str, tail_lines: int = 100) -> str:
    return await k8s.get_pod_logs(pod_name, namespace, settings.kserve_container, tail_lines)


async def list_inference_services(k8s: K8sClient, namespace: str) -> list[dict[str, Any]]:
    return await k8s.list_custom_objects(
        settings.kserve_group, settings.kserve_version, namespace, settings.kserve_plural
    )
