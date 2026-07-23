import time
import json
import threading

# ─── Configuration ───
FAILURE_THRESHOLD = 5
LATENCY_THRESHOLD_MS = 2000       # 2 seconds
LATENCY_SAMPLE_COUNT = 3
COOLDOWN_SECONDS = 10


class CircuitBreaker:
    """Per-node circuit breaker state machine."""

    def __init__(self, node: str, publish_callback=None):
        self.node = node
        self.state = "CLOSED"  # CLOSED | OPEN | HALF_OPEN
        self.failure_count = 0
        self.latency_samples: list[float] = []
        self.last_state_change = time.time()
        self._half_open_used = False
        self.publish = publish_callback

    def _transition(self, new_state: str, reason: str = ""):
        old_state = self.state
        self.state = new_state
        self.last_state_change = time.time()
        self._half_open_used = False
        msg = json.dumps({
            "type": "circuit_state",
            "source": self.node,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "payload": {
                "node": self.node,
                "state": new_state,
                "previous_state": old_state,
                "reason": reason,
            }
        })
        if self.publish:
            self.publish(msg)

    def record_failure(self, reason: str = "timeout"):
        if self.state == "CLOSED":
            self.failure_count += 1
            if self.failure_count >= FAILURE_THRESHOLD:
                self._transition("OPEN", reason)
        elif self.state == "HALF_OPEN":
            self._transition("OPEN", reason)

    def record_latency(self, latency_ms: float):
        if self.state != "CLOSED":
            return
        self.latency_samples.append(latency_ms)
        if len(self.latency_samples) > LATENCY_SAMPLE_COUNT:
            self.latency_samples.pop(0)
        if len(self.latency_samples) >= LATENCY_SAMPLE_COUNT:
            avg = sum(self.latency_samples) / len(self.latency_samples)
            if avg > LATENCY_THRESHOLD_MS:
                self.failure_count += 1
                self.latency_samples.clear()
                if self.failure_count >= FAILURE_THRESHOLD:
                    self._transition("OPEN", "high_latency")

    def record_success(self):
        if self.state == "HALF_OPEN":
            self.failure_count = 0
            self.latency_samples.clear()
            self._transition("CLOSED", "recovered")
        elif self.state == "CLOSED":
            self.failure_count = 0
            self.latency_samples.clear()

    def try_half_open(self) -> bool:
        """Attempt a HALF_OPEN probe. Returns True if probe is allowed."""
        if self.state != "HALF_OPEN":
            return False
        if self._half_open_used:
            return False
        self._half_open_used = True
        return True

    def check_cooldown(self):
        """Transition from OPEN to HALF_OPEN after cooldown."""
        if self.state == "OPEN":
            elapsed = time.time() - self.last_state_change
            if elapsed >= COOLDOWN_SECONDS:
                self._transition("HALF_OPEN", "cooldown_expired")


class CircuitBreakerManager:
    """Manages circuit breakers for all nodes."""

    def __init__(self, nodes: list[str], publish_callback=None):
        self.callback = publish_callback
        self.breakers = {
            node: CircuitBreaker(node, self._publish)
            for node in nodes
        }
        # Start cooldown checker
        self._running = True
        self._thread = threading.Thread(target=self._cooldown_loop, daemon=True)
        self._thread.start()

    def _publish(self, msg: str):
        if self.callback:
            self.callback(msg)

    def set_publish_callback(self, cb):
        self.callback = cb
        for b in self.breakers.values():
            b.publish = cb

    def get_state(self, node: str) -> str:
        return self.breakers[node].state

    def record_request(self, node: str):
        self.breakers[node].check_cooldown()

    def record_failure(self, node: str, reason: str = "timeout"):
        self.breakers[node].record_failure(reason)

    def record_success(self, node: str):
        self.breakers[node].record_success()

    def record_latency(self, node: str, latency_ms: float):
        self.breakers[node].record_latency(latency_ms)

    def try_half_open(self, node: str) -> bool:
        return self.breakers[node].try_half_open()

    def _cooldown_loop(self):
        while self._running:
            time.sleep(1)
            for breaker in self.breakers.values():
                breaker.check_cooldown()
