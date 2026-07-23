import os
import itertools

NODE_HOSTS = os.getenv("NODE_HOSTS", "192.168.1.13,192.168.1.14,192.168.1.15").split(",")
USUARIOS_PORT = int(os.getenv("USUARIOS_PORT", "8081"))
RECOMENDACIONES_PORT = int(os.getenv("RECOMENDACIONES_PORT", "8082"))
PAGOS_PORT = int(os.getenv("PAGOS_PORT", "8083"))

# Map service path prefixes to backend ports
SERVICE_PORTS = {
    "usuarios": USUARIOS_PORT,
    "recomendaciones": RECOMENDACIONES_PORT,
    "pagos": PAGOS_PORT,
}


class LoadBalancer:
    """Round-robin load balancer that skips nodes with OPEN circuit."""

    def __init__(self, nodes: list[str], cb_manager):
        self.nodes = nodes
        self.cb_manager = cb_manager
        self._round_robin = itertools.cycle(range(len(nodes)))

    def get_next_node(self, service: str) -> str | None:
        """Return the next healthy node host for the given service, or None if all are OPEN."""
        attempted = set()
        for _ in range(len(self.nodes)):
            idx = next(self._round_robin)
            node = self.nodes[idx]
            state = self.cb_manager.get_state(node)
            if state == "OPEN":
                attempted.add(node)
                continue
            if state == "HALF_OPEN":
                # Allow only 1 test request through
                if not self.cb_manager.try_half_open(node):
                    continue
            self.cb_manager.record_request(node)
            return node
        return None

    def get_node_url(self, node: str, service: str) -> str:
        port = SERVICE_PORTS.get(service, USUARIOS_PORT)
        return f"http://{node}:{port}"

    def record_success(self, node: str):
        self.cb_manager.record_success(node)

    def record_failure(self, node: str, reason: str = "timeout"):
        self.cb_manager.record_failure(node, reason)
