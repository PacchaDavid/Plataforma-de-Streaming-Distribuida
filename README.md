# 🎬 Plataforma de Streaming Distribuida

> Proyecto académico de **Sistemas Distribuidos** — 5 máquinas, 1 clúster.

Sistema que demuestra: **balanceo de carga**, **circuit breaker**, **replicación multi-maestro (Galera)** y **monitorización en tiempo real** vía Redis Pub/Sub + WebSocket.

---

## 📦 Estructura del repo

```
/proyecto-streaming-distribuido
├── deploy.sh              ← script único: ./deploy.sh <ID>
├── docker-compose.yml     ← un compose para las 5 máquinas
├── .env.example
├── frontend/              ← Máquina 1 (React/Vue)
├── gateway-python/        ← Máquina 2 (FastAPI + Redis)
├── microservicio-usuarios/
├── microservicio-recomendaciones/
├── microservicio-pagos/
├── db/
│   ├── galera-node.docker-compose.yml
│   └── init.sql
└── README.md
```

---

## 🗓️ HOY — Lo que cada uno DEBE hacer antes de reunirnos

> Esto es para que mañana sea **plug & play**. Si alguien no hace esto hoy, mañana perderemos tiempo de la demo.

### ✅ 1. Revisar hardware

Cada laptop necesita:
- 🔌 **Puerto ethernet** (si no tiene, llevar adaptador USB‑Ethernet)
- 🔋 **Cargador** (la demo puede durar horas)
- 🧰 **Destornillador** (por si el cable está muy duro y cuesta sacarlo para la demo de desconexión)

> El equipo necesita llevar **1 switch** (5+ puertos) y **5 cables de red** (uno por laptop). Confirmar quién los tiene.

### ✅ 2. Pre‑pull de imágenes Docker

**Obligatorio hacerlo HOY** porque mañana en el salón puede no haber internet o ser muy lento.

```bash
cd /proyecto-streaming-distribuido

# Según tu rol, tira las imágenes que te corresponden:

# ── TODAS las máquinas ──
docker pull bitnami/mariadb-galera:latest
docker pull eclipse-temurin:21-jdk
docker pull python:3.12-slim
docker pull node:20-alpine
docker pull redis:7-alpine

# Verificar que se descargaron:
docker images
```

### ✅ 3. Clonar el repo (si no lo hiciste)

```bash
git clone <url-del-repo> /proyecto-streaming-distribuido
cd /proyecto-streaming-distribuido
```

### ✅ 4. Dar permisos al script

```bash
chmod +x deploy.sh
```

### ✅ 5. Saber el nombre de tu interfaz de red

```bash
ip link show
# Busca algo como: eth0, enp0s3, enx00e04c..., etc.
# → Anótalo, lo necesitarás mañana para asignar la IP estática
```

---

## ⚙️ Pre-flight — Mañana (al llegar, antes de la demo)

### 1. Conectar cables y desactivar WiFi

1. Conectar cada laptop al **switch** con cable ethernet.
2. **Desconectar / desactivar WiFi**. Si el WiFi está activo, el tráfico puede ir por WiFi en vez de por cable, y las IPs estáticas no funcionarán.
   ```bash
   # Forma rápida en casi cualquier distro:
   nmcli radio wifi off
   ```
3. Todos conectados al switch → **verificar conectividad**:
   ```bash
   ping 192.168.1.11   # (cambiar según a quién estés probando)
   # Si no responde: revisar IP, cable, firewall
   ```

### 2. IP estática

Asignar IP fija en la interfaz de red que conecta al switch.

| Máquina | Integrante | Rol | IP |
|---|---|---|---|
| 1 | Justin | Frontend | `192.168.1.11` |
| 2 | Antony | Gateway | `192.168.1.12` |
| 3 | SantiagoJ | Nodo 3 | `192.168.1.13` |
| 4 | David | Nodo 4 | `192.168.1.14` |
| 5 | Parce | Nodo 5 | `192.168.1.15` |

> 💡 **Método rápido con `nmcli`** (si usas NetworkManager, casi todas las distros modernas):
> ```bash
> # Reemplaza eth0 por el nombre de tu interfaz, y 1X por tu número
> sudo nmcli con mod eth0 ipv4.addresses 192.168.1.1X/24
> sudo nmcli con mod eth0 ipv4.method manual
> sudo nmcli con down eth0 && sudo nmcli con up eth0
> ```

> 💡 **Método con Netplan (Ubuntu)**:
> ```bash
> sudo nano /etc/netplan/*.yaml
> # Ahí pones: addresses: [192.168.1.1X/24]
> sudo netplan apply
> ```

> 💡 **Método con firewall-cmd (Fedora)**:
> ```bash
> sudo nmcli con mod eth0 ipv4.addresses 192.168.1.1X/24 ipv4.method manual
> sudo nmcli con down eth0 && sudo nmcli con up eth0
> ```

### 3. Abrir puertos en el firewall

| Máquina | Puertos a abrir | Motivo |
|---|---|---|
| **1** (Frontend) | — | Solo consume HTTP/WS |
| **2** (Gateway) | `8000`, `6379` | Gateway HTTP + Redis |
| **3, 4, 5** (Nodos) | `8081`, `8082`, `8083`, `3306`, `4567`, `4568`, `4444` | Microservicios + Galera |

> 💡 **Ubuntu/Debian**: `sudo ufw allow 8000/tcp` (repetir por cada puerto)
> **Fedora**: `sudo firewall-cmd --add-port=8000/tcp --permanent && sudo firewall-cmd --reload`
> **Sin firewall**: verificar con `sudo ufw status` o `sudo firewall-cmd --list-all`

### 4. Ping test — TODOS contra TODOS

Antes de desplegar, cada uno verifica que ve a los demás:

```bash
# Ejemplo desde Máquina 3 (SantiagoJ):
ping -c1 192.168.1.11   # Frontend
ping -c1 192.168.1.12   # Gateway
ping -c1 192.168.1.13   # (yo mismo)
ping -c1 192.168.1.14   # Nodo 4
ping -c1 192.168.1.15   # Nodo 5
```

> ❌ **Si algún ping falla**, no seguir adelante. Revisar cables, IPs, firewall. Es más fácil debuggear ahora que con 10 contenedores corriendo.

---

## 🚀 Despliegue — Después del ping test

**Un solo comando por máquina. Coordinación por voz.**

### Orden de arranque

```bash
# 🥇 SantiagoJ (M3) — arranca primero, hace bootstrap de Galera automático
./deploy.sh 3

# ⏳ Esperar 15 segundos

# 🥈 David (M4) — se une al cluster
./deploy.sh 4

# 🥉 Parce (M5) — se une al cluster
./deploy.sh 5

# 4️⃣ Antony (M2) — Gateway + Redis
./deploy.sh 2

# 5️⃣ Justin (M1) — Frontend
./deploy.sh 1
```

> ⚠️ **Esperar** a que cada uno diga "listo" antes de que el siguiente ejecute.

### Verificar que todo funciona

```bash
# Probar health del gateway (desde cualquier máquina)
curl http://192.168.1.12:8000/api/health

# Probar WebSocket (desde M1 o M2)
wscat -c ws://192.168.1.12:8000/ws/monitor

# Abrir frontend en el navegador:
#   http://192.168.1.11         (vista usuario)
#   http://192.168.1.11/dashboard  (monitoreo)
```

---

## 🎯 Escenarios de demo

### Escenario 1 — Desconexión de nodo

1. Abrir `/dashboard` en el proyector.
2. Desconectar el cable de red de la Máquina 3 **físicamente** (o `docker compose stop` en M3 si no se puede el cable).
3. En ~6 segundos el dashboard marca ese nodo como **DOWN**.
4. Las peticiones de usuario siguen funcionando (Load Balancer enruta a M4 y M5).
5. Reconectar el cable → el nodo vuelve a aparecer **UP**, Galera resincroniza.

### Escenario 2 — Circuit Breaker

1. Desde otra terminal, forzar latencia alta en un nodo:
   ```bash
   curl -X POST "http://192.168.1.13:8081/debug/simulate-load?delayMs=3000&durationSec=30"
   ```
2. En el dashboard, el Circuit Breaker pasa a **OPEN** (rojo).
3. El Load Balancer deja de enrutar a ese nodo.
4. Tras 10 segundos de cooldown → pasa a **HALF_OPEN** (amarillo).
5. Llamar a `/debug/reset` para restaurar:
   ```bash
   curl -X POST "http://192.168.1.13:8081/debug/reset"
   ```
6. El Circuit Breaker vuelve a **CLOSED** (verde).

---

## 🆘 Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| `ping` no responde | Cable mal conectado, WiFi activo, IP mal configurada | Revisar cable, apagar WiFi, rehacer IP |
| `docker compose` no encontrado | Docker Compose no instalado | Revisar pre-flight |
| `deploy.sh` no se ejecuta | Permisos | `chmod +x deploy.sh` |
| Los nodos no se ven entre sí | Firewall bloquea puertos Galera | Revisar puertos `4567,4568,4444,3306` |
| Gateway responde 502 | Nodos backend caídos | `docker compose ps` en M3, M4, M5 |
| Dashboard no muestra datos | WebSocket no conecta | Verificar que M1 alcanza a M2 puerto 8000 |
| Galera no arranca | Cluster no‑primario | Solo 1 nodo puede caer a la vez. Reconectar rápido. |
| Imagen Docker no encontrada | No se hizo pre‑pull | Necesitas internet para `docker pull` |

---

## 📋 Contratos clave

| Concepto | Valor |
|---|---|
| Microservicios | Usuarios:8081, Recomendaciones:8082, Pagos:8083 |
| Gateway | HTTP+WS:8000 (mismo puerto) |
| Redis | 6379 (Máquina 2) |
| MariaDB Galera | 3306 (cada nodo) |
| Timeout proxy → nodo | 2 segundos |
| Umbral Circuit Breaker | 5 fallos consecutivos o 3 respuestas >2s |
| Cooldown OPEN | 10 segundos |
| Heartbeat → DOWN | 6 segundos sin mensaje |

---

## 📝 Notas para el día de la demo

- **Proyectar solo el frontend** (Máquina 1, Justin). Ahí está `/dashboard`.
- Los cambios de estado se ven **solos**, no hay que refrescar nada.
- Si el Circuit Breaker tarda en abrirse, reducir el timeout del proxy a 1s en el gateway.
- Desconectar **solo un cable a la vez** para no perder quórum de Galera.
- Mantener las desconexiones **cortas** (segundos) para que Galera haga IST rápido en vez de SST lento.
