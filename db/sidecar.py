#!/usr/bin/env python3
"""
Sidecar de replicacion — publica estado de Galera a Redis cada 3 segundos.
Corre en cada maquina nodo (M3, M4, M5).
"""
import subprocess
import json
import os
import time
import redis

REDIS_HOST = os.environ.get("REDIS_HOST", "192.168.1.12")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
MARIADB_PORT = os.environ.get("MARIADB_PORT", "3306")
GALERA_NODE_NAME = os.environ.get("GALERA_NODE_NAME", "unknown")
MYSQL_USER = "root"
MYSQL_PASS = "changeme_demo"

MYSQL_CMD = [
    "mysql",
    f"-h127.0.0.1",
    f"-P{MARIADB_PORT}",
    f"-u{MYSQL_USER}",
    f"-p{MYSQL_PASS}",
    "-N",  # Skip column names in output
]


def get_wsrep_status():
    """Query Galera status variables and return as dict."""
    try:
        result = subprocess.run(
            MYSQL_CMD + [
                "-e",
                "SHOW STATUS WHERE Variable_name IN ('wsrep_cluster_size', 'wsrep_local_state_comment', 'wsrep_ready')"
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return None

        status = {"node": GALERA_NODE_NAME}
        for line in result.stdout.strip().split("\n"):
            if "\t" in line:
                key, value = line.split("\t", 1)
                key = key.strip().lower()
                if "wsrep_cluster_size" in key:
                    status["wsrep_cluster_size"] = int(value)
                elif "wsrep_local_state_comment" in key:
                    status["wsrep_local_state_comment"] = value
                elif "wsrep_ready" in key:
                    status["wsrep_ready"] = value

        return status
    except Exception as e:
        print(f"[Sidecar] Error querying Galera: {e}")
        return None


def main():
    print(f"[Sidecar] Iniciando monitoreo de Galera en {GALERA_NODE_NAME}")
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

    while True:
        try:
            status = get_wsrep_status()
            if status:
                r.publish("db:replication:status", json.dumps(status))
            else:
                # Publish node as down if we can't reach Galera
                r.publish("db:replication:status", json.dumps({
                    "node": GALERA_NODE_NAME,
                    "wsrep_cluster_size": 0,
                    "wsrep_local_state_comment": "Unknown",
                    "wsrep_ready": "OFF",
                }))
        except Exception as e:
            print(f"[Sidecar] Error: {e}")

        time.sleep(3)


if __name__ == "__main__":
    main()
