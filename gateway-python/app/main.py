import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from .load_balancer import LoadBalancer
from .circuit_breaker import CircuitBreakerManager
from .redis_bridge import RedisBridge
from .proxy_routes import router as proxy_router

# ─── Config ───
NODE_HOSTS = os.getenv("NODE_HOSTS", "192.168.1.13,192.168.1.14,192.168.1.15").split(",")
USUARIOS_PORT = int(os.getenv("USUARIOS_PORT", "8081"))
RECOMENDACIONES_PORT = int(os.getenv("RECOMENDACIONES_PORT", "8082"))
PAGOS_PORT = int(os.getenv("PAGOS_PORT", "8083"))
REDIS_HOST = os.getenv("REDIS_HOST", "192.168.1.12")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# ─── Global State ───
cb_manager = CircuitBreakerManager(NODE_HOSTS)
lb = LoadBalancer(NODE_HOSTS, cb_manager)
redis_bridge = RedisBridge(REDIS_HOST, REDIS_PORT)
connected_websockets: set[WebSocket] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cb_manager.set_publish_callback(lambda msg: asyncio.create_task(broadcast_ws(msg)))
    asyncio.create_task(redis_bridge.start(lambda msg: asyncio.create_task(broadcast_ws(msg))))
    yield
    # Shutdown
    redis_bridge.stop()


app = FastAPI(title="Streaming Gateway", lifespan=lifespan)
app.include_router(proxy_router, prefix="/api")


async def broadcast_ws(message: str):
    """Send message to all connected WebSocket clients."""
    dead = set()
    for ws in connected_websockets:
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    connected_websockets.difference_update(dead)


@app.websocket("/ws/monitor")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_websockets.add(ws)
    try:
        while True:
            await ws.receive_text()  # keepalive ping
    except WebSocketDisconnect:
        connected_websockets.discard(ws)
    except Exception:
        connected_websockets.discard(ws)


@app.get("/api/health")
async def health():
    nodes_status = {}
    for node in NODE_HOSTS:
        state = cb_manager.get_state(node)
        nodes_status[node] = state
    return JSONResponse({
        "status": "UP",
        "nodes": nodes_status,
        "websocket_clients": len(connected_websockets),
    })


@app.get("/api/circuit-states")
async def circuit_states():
    return JSONResponse({
        node: cb_manager.get_state(node) for node in NODE_HOSTS
    })
