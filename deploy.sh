#!/bin/bash
set -e

MACHINE_ID=$1

# ─── Mapa de IPs estáticas (solo se toca aquí si cambian las IPs) ───
IPS=( "" "192.168.1.11" "192.168.1.12" "192.168.1.13" "192.168.1.14" "192.168.1.15" )

# ─── Determinar rol ───
case $MACHINE_ID in
  1) ROLE="frontend" ;;
  2) ROLE="gateway"  ;;
  3|4|5) ROLE="node" ;;
  *) echo "❌ ID inválido. Usa: 1 (frontend), 2 (gateway), 3|4|5 (node)"; exit 1 ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Streaming Distribuido — Máquina $MACHINE_ID"
echo "  Rol: $ROLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Generar .env ───
cat > .env <<EOF
MACHINE_ID=$MACHINE_ID
MACHINE_ROLE=$ROLE
GATEWAY_HOST=${IPS[2]}
REDIS_HOST=${IPS[2]}
REDIS_PORT=6379
NODE_HOSTS=${IPS[3]},${IPS[4]},${IPS[5]}
USUARIOS_PORT=8081
RECOMENDACIONES_PORT=8082
PAGOS_PORT=8083
MARIADB_PORT=3306
GALERA_CLUSTER_ADDRESS=gcomm://${IPS[3]},${IPS[4]},${IPS[5]}
GALERA_NODE_NAME=nodo${MACHINE_ID}
GALERA_NODE_ADDRESS=${IPS[$MACHINE_ID]}
EOF

echo "✅ .env generado para Máquina $MACHINE_ID ($ROLE)"

# ─── Bootstrap: si soy el nodo 3 Y soy el primero en arrancar ───
if [ "$ROLE" = "node" ] && [ "$MACHINE_ID" = "3" ]; then
  if ! ping -c1 -W1 ${IPS[4]} &>/dev/null && ! ping -c1 -W1 ${IPS[5]} &>/dev/null; then
    echo "🔵 Soy el primer nodo — arrancando en modo bootstrap..."
    export GALERA_CLUSTER_ADDRESS=gcomm://
    docker compose --profile node up -d
    echo "⏳ Esperando 15s a que Galera termine bootstrap..."
    sleep 15
    echo "✅ Nodo 3 listo como bootstrap"
    exit 0
  fi
fi

# ─── Arranque normal ───
echo "🚀 Arrancando Máquina $MACHINE_ID como $ROLE..."
docker compose --profile $ROLE up -d

# ─── Mostrar estado ───
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps --services --filter "status=running" 2>/dev/null || echo "(sin servicios aún)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Máquina $MACHINE_ID lista!"
