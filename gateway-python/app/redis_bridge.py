import os
import json
import asyncio
import redis.asyncio as aioredis
from .circuit_breaker import CircuitBreakerManager

REDIS_HOST = os.getenv("REDIS_HOST", "192.168.1.12")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
# Subscribe to all heartbeat channels and the circuit:state and db:replication:status channels
CHANNELS = ["circuit:state", "db:replication:status", "heartbeat:*"]


class RedisBridge:
    """Subscribes to Redis pub/sub channels and forwards messages to a callback."""

    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.pubsub = None
        self._running = False

    async def start(self, callback):
        """Subscribe to all channels and forward messages to callback."""
        self._running = True
        try:
            r = aioredis.Redis(host=self.host, port=self.port)
            self.pubsub = r.pubsub()
            await self.pubsub.psubscribe(*CHANNELS)
            async for message in self.pubsub.listen():
                if not self._running:
                    break
                if message["type"] == "pmessage":
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode("utf-8")
                    try:
                        # Wrap in standard envelope
                        payload = json.loads(data)
                        envelope = {
                            "type": "heartbeat" if "heartbeat" in message["channel"].decode() else
                                    "circuit_state" if "circuit" in message["channel"].decode() else
                                    "replication_status",
                            "source": payload.get("node") or payload.get("machine_id", "unknown"),
                            "timestamp": payload.get("timestamp", ""),
                            "payload": payload,
                        }
                        await callback(json.dumps(envelope))
                    except json.JSONDecodeError:
                        pass
        except Exception as e:
            print(f"[RedisBridge] Error: {e}")
        finally:
            self._running = False

    def stop(self):
        self._running = False
        if self.pubsub:
            self.pubsub.close()
