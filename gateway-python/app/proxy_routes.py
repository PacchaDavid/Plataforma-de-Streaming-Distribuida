import os
import time
import json
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import JSONResponse

from .load_balancer import LoadBalancer
from .circuit_breaker import CircuitBreakerManager

NODE_HOSTS = os.getenv("NODE_HOSTS", "192.168.1.13,192.168.1.14,192.168.1.15").split(",")

# Shared instances (set from main)
lb: LoadBalancer = None
cb_manager: CircuitBreakerManager = None
PROXY_TIMEOUT = float(os.getenv("PROXY_TIMEOUT", "2.0"))  # 2 second timeout


def init(nodes: list[str], _lb: LoadBalancer, _cb: CircuitBreakerManager):
    global lb, cb_manager
    lb = _lb
    cb_manager = _cb


router = APIRouter()


def get_service_from_path(path: str) -> str:
    """Extract service name from URL path."""
    parts = path.strip("/").split("/")
    if parts and parts[0] in ("usuarios", "recomendaciones", "pagos"):
        return parts[0]
    return "usuarios"


async def proxy_request(request: Request, service: str) -> Response:
    """Forward request to a healthy backend node."""
    if lb is None:
        return JSONResponse({"error": "LB not initialized"}, status_code=503)

    node = lb.get_next_node(service)
    if node is None:
        return JSONResponse(
            {"error": "Service Unavailable - All nodes are OPEN"},
            status_code=503,
        )

    # Build backend URL
    path = request.url.path.replace(f"/api/{service}", f"/api/{service}", 1)
    if request.url.query:
        path += "?" + request.url.query
    backend_url = f"http://{node}:{lb.SERVICE_PORTS.get(service, 8081)}{path}"

    # Forward request with timeout
    try:
        start = time.time()
        async with httpx.AsyncClient(timeout=PROXY_TIMEOUT) as client:
            resp = await client.request(
                method=request.method,
                url=backend_url,
                headers={k: v for k, v in request.headers.items()
                         if k.lower() not in ("host", "content-length")},
                content=await request.body(),
            )
        elapsed_ms = (time.time() - start) * 1000

        # Record result
        if resp.status_code >= 500:
            lb.record_failure(node, "5xx")
        elif elapsed_ms > 2000:
            cb_manager.record_latency(node, elapsed_ms)
        else:
            lb.record_success(node)

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=dict(resp.headers),
        )
    except httpx.TimeoutException:
        lb.record_failure(node, "timeout")
        return JSONResponse({"error": "Backend timeout"}, status_code=504)
    except Exception as e:
        lb.record_failure(node, "connection_error")
        return JSONResponse({"error": str(e)}, status_code=502)


# ─── Dynamic proxy routes ───

@router.api_route("/usuarios/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_usuarios(request: Request, path: str):
    return await proxy_request(request, "usuarios")


@router.api_route("/recomendaciones/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_recomendaciones(request: Request, path: str):
    return await proxy_request(request, "recomendaciones")


@router.api_route("/pagos/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_pagos(request: Request, path: str):
    return await proxy_request(request, "pagos")
