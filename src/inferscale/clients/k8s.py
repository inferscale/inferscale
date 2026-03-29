import asyncio
import logging
import threading
from typing import Any

from kubernetes import client, config
from kubernetes.client.exceptions import ApiException

logger = logging.getLogger(__name__)


class K8sClientError(Exception):
    def __init__(self, message: str, status: int | None = None):
        self.message = message
        self.status = status
        super().__init__(self.message)


class K8sClient:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._custom_api: client.CustomObjectsApi | None = None
        self._core_api: client.CoreV1Api | None = None

    def _load_config(self) -> None:
        try:
            config.load_incluster_config()
        except config.ConfigException:
            config.load_kube_config()

    def _get_custom_api(self) -> client.CustomObjectsApi:
        with self._lock:
            if self._custom_api is None:
                self._load_config()
                self._custom_api = client.CustomObjectsApi()
            return self._custom_api

    def _get_core_api(self) -> client.CoreV1Api:
        with self._lock:
            if self._core_api is None:
                self._load_config()
                self._core_api = client.CoreV1Api()
            return self._core_api

    async def create_custom_object(
        self, group: str, version: str, namespace: str, plural: str, body: dict[str, Any]
    ) -> dict[str, Any]:
        api = self._get_custom_api()
        try:
            return await asyncio.to_thread(
                api.create_namespaced_custom_object,
                group=group,
                version=version,
                namespace=namespace,
                plural=plural,
                body=body,
            )
        except ApiException as exc:
            raise K8sClientError(exc.reason or str(exc), status=exc.status) from exc

    async def get_custom_object(
        self, group: str, version: str, namespace: str, plural: str, name: str
    ) -> dict[str, Any] | None:
        api = self._get_custom_api()
        try:
            return await asyncio.to_thread(
                api.get_namespaced_custom_object,
                group=group,
                version=version,
                namespace=namespace,
                plural=plural,
                name=name,
            )
        except ApiException as exc:
            if exc.status == 404:
                return None
            raise K8sClientError(exc.reason or str(exc), status=exc.status) from exc

    async def delete_custom_object(
        self, group: str, version: str, namespace: str, plural: str, name: str
    ) -> bool:
        api = self._get_custom_api()
        try:
            await asyncio.to_thread(
                api.delete_namespaced_custom_object,
                group=group,
                version=version,
                namespace=namespace,
                plural=plural,
                name=name,
            )
            return True
        except ApiException as exc:
            if exc.status == 404:
                return False
            raise K8sClientError(exc.reason or str(exc), status=exc.status) from exc

    async def list_custom_objects(
        self, group: str, version: str, namespace: str, plural: str
    ) -> list[dict[str, Any]]:
        api = self._get_custom_api()
        try:
            result = await asyncio.to_thread(
                api.list_namespaced_custom_object,
                group=group,
                version=version,
                namespace=namespace,
                plural=plural,
            )
        except ApiException as exc:
            raise K8sClientError(exc.reason or str(exc), status=exc.status) from exc
        return result.get("items", [])

    async def list_pods(self, namespace: str, label_selector: str) -> list[dict[str, str]]:
        v1 = self._get_core_api()
        try:
            pods = await asyncio.to_thread(
                v1.list_namespaced_pod,
                namespace=namespace,
                label_selector=label_selector,
            )
        except ApiException as exc:
            raise K8sClientError(exc.reason or str(exc), status=exc.status) from exc
        return [
            {
                "name": p.metadata.name,
                "status": p.status.phase if p.status else "Unknown",
            }
            for p in (pods.items or [])
        ]

    async def get_pod_logs(
        self, pod_name: str, namespace: str, container: str, tail_lines: int = 100
    ) -> str:
        v1 = self._get_core_api()
        try:
            logs: str = await asyncio.to_thread(
                v1.read_namespaced_pod_log,
                name=pod_name,
                namespace=namespace,
                container=container,
                tail_lines=tail_lines,
            )
            return logs
        except ApiException:
            logger.warning("Failed to read logs for pod %s", pod_name, exc_info=True)
            return ""


k8s_client = K8sClient()
