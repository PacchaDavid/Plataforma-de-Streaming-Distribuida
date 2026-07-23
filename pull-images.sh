#!/bin/bash
# ============================================================
# pull-images.sh — Precarga de imágenes Docker
# ============================================================
# Descarga y construye TODAS las imágenes necesarias para el
# proyecto Streaming Distribuido. Ideal para ejecutar ANTES
# de desconectarse de internet.
#
# Uso:
#   ./pull-images.sh              # Descarga y construye todo
#   ./pull-images.sh --save       # + exporta a streaming-images.tar
#   ./pull-images.sh --load       # Importa desde streaming-images.tar
#   ./pull-images.sh --list       # Muestra que se va a descargar
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TAR_FILE="${SCRIPT_DIR}/streaming-images.tar"
COMPOSE="docker compose -f ${SCRIPT_DIR}/docker-compose.yml"

# ───────────────────────────────────────────────
# Imágenes base que necesita cada Dockerfile
# ───────────────────────────────────────────────
BASE_IMAGES=(
  "bitnamilegacy/mariadb-galera:latest"
  "redis:7-alpine"
  "python:3.12-slim"
  "python:3.12-alpine"
  "node:20-alpine"
  "nginx:alpine"
  "eclipse-temurin:21-jdk"
  "eclipse-temurin:21-jre"
)

# ───────────────────────────────────────────────
# Imágenes construidas localmente (con image: explícito)
# ───────────────────────────────────────────────
CUSTOM_IMAGES=(
  "streaming-local/gateway:latest"
  "streaming-local/frontend:latest"
  "streaming-local/usuarios:latest"
  "streaming-local/recomendaciones:latest"
  "streaming-local/pagos:latest"
  "streaming-local/sidecar-replicacion:latest"
)

# Mapa: imagen tag → nombre del servicio en docker-compose
CUSTOM_SERVICE_MAP="streaming-local/gateway:latest=gateway
streaming-local/frontend:latest=frontend
streaming-local/usuarios:latest=usuarios
streaming-local/recomendaciones:latest=recomendaciones
streaming-local/pagos:latest=pagos
streaming-local/sidecar-replicacion:latest=sidecar-replicacion"

# ───────────────────────────────────────────────
# Flags
# ───────────────────────────────────────────────
MODE="${1:---pull}"

show_list() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📦 Imágenes base a descargar (${#BASE_IMAGES[@]})"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for img in "${BASE_IMAGES[@]}"; do
    echo "   • $img"
  done
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🔨 Imágenes a construir (${#CUSTOM_IMAGES[@]})"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for img in "${CUSTOM_IMAGES[@]}"; do
    echo "   • $img"
  done
  echo ""
  total=$(( ${#BASE_IMAGES[@]} + ${#CUSTOM_IMAGES[@]} ))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Total: ${#BASE_IMAGES[@]} pulls + ${#CUSTOM_IMAGES[@]} builds = $total imágenes"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

pull_images() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ⬇️  Descargando imágenes base…"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for img in "${BASE_IMAGES[@]}"; do
    echo ""
    echo "  📥 Pulling: $img"
    docker pull "$img"
  done
  echo ""
  echo "  ✅ Todas las imágenes base descargadas."
}

build_images() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🔨 Construyendo servicios locales…"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # Necesitamos .env para construir (valores dummy)
  if [ ! -f "${SCRIPT_DIR}/.env" ]; then
    echo "  ⚠️  No hay .env, creando uno temporal…"
    cat > "${SCRIPT_DIR}/.env" <<-EOF
MACHINE_ID=3
MACHINE_ROLE=node
GATEWAY_HOST=192.168.1.2
REDIS_HOST=192.168.1.2
REDIS_PORT=6379
NODE_HOSTS=192.168.1.3,192.168.1.4,192.168.1.5
USUARIOS_PORT=8081
RECOMENDACIONES_PORT=8082
PAGOS_PORT=8083
MARIADB_PORT=3306
GALERA_CLUSTER_ADDRESS=gcomm://192.168.1.3,192.168.1.4,192.168.1.5
GALERA_NODE_NAME=nodo3
GALERA_NODE_ADDRESS=192.168.1.3
EOF
    TEMP_ENV=1
  fi

  # Construir cada servicio — docker compose usará el tag image: explícito
  while IFS='=' read -r TAG SVC; do
    echo ""
    echo "  🔨 Building $SVC → $TAG"
    $COMPOSE build "$SVC"
  done <<< "$CUSTOM_SERVICE_MAP"

  if [ -n "$TEMP_ENV" ]; then
    echo "  🧹 Limpiando .env temporal…"
    rm -f "${SCRIPT_DIR}/.env"
  fi
  echo ""
  echo "  ✅ Todos los servicios construidos."
}

save_tar() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📦 Exportando imágenes a: $TAR_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Unir todas las imágenes (base + custom)
  ALL_IMAGES=("${BASE_IMAGES[@]}" "${CUSTOM_IMAGES[@]}")

  echo "  Exportando ${#ALL_IMAGES[@]} imágenes…"
  echo ""
  for img in "${ALL_IMAGES[@]}"; do
    echo "   • $img"
  done
  echo ""
  # Verificar que todas las imágenes existan antes de guardar
  for img in "${ALL_IMAGES[@]}"; do
    docker image inspect "$img" &>/dev/null || {
      echo "  ❌ Error: La imagen '$img' no está disponible localmente."
      echo "     Ejecuta './pull-images.sh' primero para descargar/construir todo."
      exit 1
    }
  done

  docker save "${ALL_IMAGES[@]}" -o "$TAR_FILE" 2>&1
  echo ""
  du -sh "$TAR_FILE"
  echo "  ✅ Exportado exitosamente."
}

load_tar() {
  if [ ! -f "$TAR_FILE" ]; then
    echo "❌ No se encuentra $TAR_FILE"
    exit 1
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📂 Cargando imágenes desde: $TAR_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  docker load -i "$TAR_FILE"
  echo ""
  echo "  ✅ Imágenes cargadas. Ya puedes ejecutar ./deploy.sh <N>"
}

# ─── Main ─────────────────────────────────────
case "$MODE" in
  --list)
    show_list
    ;;
  --save)
    pull_images
    build_images
    save_tar
    echo ""
    echo "🎉 Listo! Lleva 'streaming-images.tar' a las otras máquinas"
    echo "   y ejecuta:  ./pull-images.sh --load"
    ;;
  --load)
    load_tar
    ;;
  *)
    pull_images
    build_images
    echo ""
    echo "🎉 Todas las imágenes están listas localmente."
    echo "   Ahora puedes ejecutar ./deploy.sh <N> sin internet."
    ;;
esac
