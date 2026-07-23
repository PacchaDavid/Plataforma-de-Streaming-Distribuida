# 🧪 Plan de Pruebas — Plataforma de Streaming Distribuida

> Documento para registrar las evidencias del proyecto de Sistemas Distribuidos.
> Cada prueba debe ejecutarse, marcarse como ✅ / ❌ y anexar la evidencia indicada en la columna **📸 Evidencia**.

---

## Fase 0 — Preparación del entorno

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| P-001 | **IP estática configurada** | 1. `ip addr show` en cada máquina. 2. Verificar que la IP corresponde al rol. | Cada máquina muestra su IP (11, 12, 13, 14 o 15) en la interfaz ethernet. | 2 min | Captura de `ip addr show` |
| P-002 | **Puertos de firewall abiertos** | 1. En M2: `sudo ufw status` o `sudo firewall-cmd --list-all`. 2. Verificar puertos 8000 y 6379. 3. En M3, M4, M5: verificar puertos 8081-8083, 3306, 4567, 4568, 4444. | Los puertos aparecen como ALLOW. | 2 min | Captura del comando |
| P-003 | **Conectividad en malla completa** | 1. M1 → ping a M2, M3, M4, M5. 2. M2 → ping a M3, M4, M5. 3. **M3 → ping a M4 y M5.** 4. **M4 → ping a M3 y M5.** 5. **M5 → ping a M3 y M4.** | Todos los pings responden con 0% pérdida. Especialmente los pares M3↔M4↔M5 (crítico para Galera). | 3 min | Captura de pings exitosos |
| P-004 | **Docker instalado y funcionando** | 1. `docker --version`. 2. `docker compose version`. 3. `docker run hello-world`. | Versiones mostradas. hello-world sin error. | 1 min | Captura de terminal |
| P-005 | **Imágenes Docker precargadas** | 1. `docker images \| grep -E "mariadb-galera\|temurin\|python\|node\|redis"`. | Todas las imágenes aparecen en la lista local. Si falta alguna, hacer `docker pull` ahora. | 2 min | Captura de `docker images` |
| P-006 | **Script deploy.sh listo** | 1. `ls -la deploy.sh` (existe). 2. `head -1 deploy.sh` (`#!/bin/bash`). 3. `chmod +x deploy.sh` si no lo está. | Archivo existe y es ejecutable. | 1 min | Captura de `ls -la` |
| P-007 | **Espacio en disco suficiente** | 1. `docker system df`. 2. `df -h /`. | Al menos 5 GB libres para imágenes y contenedores. | 1 min | Captura de `df -h` |

---

## Fase 1 — Despliegue

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| D-001 | **Bootstrap del cluster Galera (M3)** | 1. En M3: `./deploy.sh 3`. 2. Esperar 15s. 3. `docker compose ps`. 4. `docker logs $(docker ps -q -f name=mariadb) 2>/dev/null \| grep -i wsrep \| tail -5`. | MariaDB corriendo. Logs muestran "Synchronized with group" o "Server ready". | 30s | Captura de logs WSREP |
| D-002 | **Union de M4 al cluster** | 1. En M4: `./deploy.sh 4`. 2. Esperar 10s. 3. `docker compose ps`. 4. Verificar logs de MariaDB en M4. | M4 se une. Logs: "Joined the group". | 20s | Captura de logs |
| D-003 | **Union de M5 al cluster** | 1. En M5: `./deploy.sh 5`. 2. Esperar 10s. 3. `docker compose ps`. 4. Verificar logs de MariaDB en M5. | M5 se une. 3 nodos sincronizados. | 20s | Captura de logs |
| D-004 | **Gateway + Redis (M2)** | 1. En M2: `./deploy.sh 2`. 2. Esperar 10s. 3. `curl http://192.168.1.12:8000/api/health`. | Gateway responde 200 OK. Redis corriendo. | 20s | Captura de curl |
| D-005 | **Frontend (M1)** | 1. En M1: `./deploy.sh 1`. 2. Esperar 10s. 3. Abrir `http://192.168.1.11` en navegador. | Frontend carga. Vista usuario `/` y dashboard `/dashboard` accesibles. | 20s | Captura de pantalla del frontend |

---

## Fase 2 — Replicacion de base de datos

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| R-001 | **Cluster size: 3/3 nodos** | 1. En M3: `docker exec -it $(docker ps -q -f name=mariadb) mysql -uroot -pchangeme_demo -e "SHOW STATUS LIKE 'wsrep_cluster_size'"`. 2. Repetir en M4 y M5. | `wsrep_cluster_size` = `3` en los 3 nodos. | 3 min | Captura en cada nodo |
| R-002 | **Estado: Synced** | 1. En M3: `SHOW STATUS LIKE 'wsrep_local_state_comment'`. 2. Repetir en M4 y M5. | `wsrep_local_state_comment` = `Synced` en los 3. | 2 min | Captura en cada nodo |
| R-003 | **Insercion desde M3 → M4 y M5** | 1. En M3: `INSERT INTO usuarios (nombre, email) VALUES ('Test R03', 'r03@test.com')`. 2. En M4: `SELECT * FROM usuarios WHERE email='r03@test.com'`. 3. En M5: igual. | El registro aparece en los 3 nodos. | 3 min | Captura de SELECT en M4 y M5 |
| R-004 | **Insercion desde M4 → M3 y M5** | 1. En M4: `INSERT INTO usuarios (nombre, email) VALUES ('Test R04', 'r04@test.com')`. 2. Verificar en M3 y M5. | Registro aparece en los 3 nodos. | 2 min | Captura de SELECT |
| R-005 | **Insercion desde M5 → M3 y M4** | 1. En M5: `INSERT INTO usuarios (nombre, email) VALUES ('Test R05', 'r05@test.com')`. 2. Verificar en M3 y M4. | Registro aparece en los 3 nodos. | 2 min | Captura de SELECT |
| R-006 | **Eliminacion replicada** | 1. En M3: `DELETE FROM usuarios WHERE email LIKE 'r0%@test.com'`. 2. Verificar en M4 y M5. | Registros eliminados de los 3 nodos. | 2 min | Captura de SELECT confirmando 0 filas |

---

## Fase 3 — Heartbeats y monitorización

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| H-001 | **Heartbeats Java → Redis** | 1. En M2: `redis-cli -h 192.168.1.12`. 2. `SUBSCRIBE heartbeat:*`. 3. Esperar 8s. | Llegan mensajes en `heartbeat:{id}:usuarios`, `heartbeat:{id}:recomendaciones`, `heartbeat:{id}:pagos` cada ~2s. Se ven los 3 servicios de los 3 nodos (9 canales en total). | 15s | Captura de suscripción Redis |
| H-002 | **Sidecar replicacion → Redis** | 1. En M2: `redis-cli`. 2. `SUBSCRIBE db:replication:status`. 3. Esperar 8s. | Llegan mensajes cada ~3s con `wsrep_cluster_size`, `wsrep_local_state_comment` y `wsrep_ready` desde cada nodo. | 15s | Captura de mensajes del canal |
| H-003 | **Bridge Redis → WebSocket** | 1. En M1: `wscat -c ws://192.168.1.12:8000/ws/monitor`. 2. Esperar 8s. | Llegan mensajes JSON con `type: "heartbeat"`, `type: "circuit_state"`, `type: "replication_status"`. | 10s | Captura de mensajes WebSocket |
| H-004 | **Dashboard muestra nodos UP** | 1. Abrir `http://192.168.1.11/dashboard`. 2. Observar tarjetas de nodos 3, 4, 5. | Los 3 nodos aparecen en UP/verde con sus 3 servicios. | 5s | Captura de pantalla del dashboard |
| H-005 | **Dashboard muestra cluster 3/3** | 1. En el dashboard, buscar indicador de replicacion. | Muestra "3/3 nodos sincronizados" en verde. | 5s | Captura de pantalla |
| H-006 | **Dashboard muestra timeline** | 1. En el dashboard, buscar panel de eventos/timeline. | Eventos de heartbeat, circuit_state y replication_status con timestamps. | 5s | Captura de pantalla |

---

## Fase 4 — Tolerancia a fallos — Desconexión de nodo

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| F-001 | **Caida de M3 → Dashboard DOWN** | 1. Abrir dashboard y proyectar. 2. Desconectar cable de M3 o `docker compose stop` en M3. 3. Observar dashboard. | En ~6s las tarjetas de M3 pasan a DOWN/rojo. Timeline registra heartbeat perdido. | 15s | **VIDEO** del dashboard |
| F-002 | **Sistema funciona sin M3** | 1. Abrir `http://192.168.1.11`. 2. Navegar catalogo, abrir detalle, crear usuario. | Peticiones OK. Load Balancer enruta a M4 y M5. | 30s | **VIDEO** continuacion del anterior |
| F-003 | **Cluster Galera 2/3** | 1. En M4: `SHOW STATUS LIKE 'wsrep_cluster_size'`. | `wsrep_cluster_size` = `2`. | 2 min | Captura del comando |
| F-004 | **Reconexion de M3 → UP otra vez** | 1. Reconectar cable o `docker compose start` en M3. 2. Esperar ~10s. 3. Observar dashboard. | Dashboard marca M3 como UP/verde. Cluster vuelve a 3/3. | 20s | **VIDEO** del dashboard |
| F-005 | **Datos replicados a M3 (IST)** | 1. En M3: `SELECT * FROM usuarios`. 2. Buscar datos creados en F-002. | Los datos creados mientras M3 estaba caído aparecen en M3 (IST). | 2 min | Captura de SELECT |

---

## Fase 5 — Circuit Breaker

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| C-001 | **Simular latencia alta en M3** | 1. `curl -X POST "http://192.168.1.13:8081/debug/simulate-load?delayMs=3000&durationSec=40"`. 2. Verificar que el microservicio responde. | Microservicio responde con delay simulado de 3s. | 5s | Captura del curl |
| C-002 | **CB se abre (OPEN)** | 1. Con carga activa en M3, hacer 5-6 peticiones al gateway: `for i in {1..6}; do curl -s -o /dev/null -w "%{http_code} " http://192.168.1.12:8000/api/usuarios/; done`. 2. Observar dashboard. | Dashboard muestra CB de M3 en OPEN/rojo. Timeline registra transicion. | 30s | **VIDEO** del dashboard + captura de terminal |
| C-003 | **LB no enruta a M3** | 1. Hacer 10 peticiones: `for i in {1..10}; do curl -s http://192.168.1.12:8000/api/usuarios/ > /dev/null; done`. 2. Revisar logs del gateway: `docker logs $(docker ps -q -f name=gateway) 2>/dev/null \| grep "enrutando" \| tail -10`. | Ninguna peticion se enruta a M3. Solo M4 y M5. Gateway responde 200. | 20s | Captura de logs del gateway |
| C-004 | **Cooldown → HALF_OPEN** | 1. Esperar 10s. 2. Observar dashboard. | CB de M3 pasa a HALF_OPEN/amarillo. | 15s | Captura del dashboard |
| C-005 | **Restaurar M3 y cerrar CB** | 1. `curl -X POST "http://192.168.1.13:8081/debug/reset"`. 2. `curl http://192.168.1.12:8000/api/usuarios/`. 3. Observar dashboard. | CB vuelve a CLOSED/verde. M3 recibe trafico otra vez. | 10s | **VIDEO** del dashboard |
| C-006 | **503 si TODOS los nodos estan OPEN** | 1. M3: `curl -X POST "http://192.168.1.13:8081/debug/simulate-failure?durationSec=30"`. 2. M4: `curl -X POST "http://192.168.1.14:8081/debug/simulate-failure?durationSec=30"`. 3. M5: `curl -X POST "http://192.168.1.15:8081/debug/simulate-failure?durationSec=30"`. 4. `curl -w "%{http_code}" http://192.168.1.12:8000/api/usuarios/`. | Gateway responde 503. No se cuelga ni crashea. | 30s | Captura del 503 |
| C-007 | **Recuperacion tras 503** | 1. En M3: `curl -X POST "http://192.168.1.13:8081/debug/reset"`. 2. En M4: `curl -X POST "http://192.168.1.14:8081/debug/reset"`. 3. En M5: `curl -X POST "http://192.168.1.15:8081/debug/reset"`. 4. Esperar cooldown (~10s). 5. `curl -w "%{http_code}" http://192.168.1.12:8000/api/usuarios/`. 6. Ver dashboard. | Gateway responde 200. Circuitos CLOSED. | 30s | Captura de curl + dashboard |

---

## Fase 6 — Monitorización desacoplada

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| M-001 | **WS sigue vivo sin nodos backend** | 1. `docker compose stop` en M3, M4, M5. 2. En M1: `wscat -c ws://192.168.1.12:8000/ws/monitor`. 3. Esperar 10s. | WebSocket sigue conectado. Llegan mensajes de `circuit:state`. Los heartbeats se detienen (esperado). | 30s | Captura de WebSocket activo |
| M-002 | **Dashboard muestra nodos DOWN** | 1. Con M3, M4, M5 detenidos, observar dashboard. | Los 3 nodos en DOWN/rojo. Dashboard funcionando y actualizandose. | 10s | Captura de pantalla |
| M-003 | **Recuperacion total** | 1. Arrancar M3, M4, M5 otra vez. 2. Esperar 15s. 3. Verificar dashboard. | Los 3 nodos UP. Cluster 3/3. Circuitos CLOSED. | 30s | Captura de pantalla |

---

## Fase 7 — Pruebas de estrés (opcional)

| ID | Detalle | Pasos | Resultado Esperado | ⏱ Tiempo | 📸 Evidencia |
|---|---|---|---|---|---|
| S-001 | **Carga concurrente en 3 nodos** | 1. Desde M1: `for i in {1..50}; do curl -s http://192.168.1.12:8000/api/usuarios/ & done; wait`. 2. Verificar respuestas. | Todas responden sin error. LB distribuye entre los 3 nodos. | 30s | Captura de terminal |
| S-002 | **Caida y reconexion de Redis** | 1. En M2: `docker compose restart redis`. 2. Observar dashboard. 3. Verificar heartbeats continuan. | Redis se reinicia. Heartbeats se reanudan. Dashboard no se cuelga. | 20s | Captura de terminal + dashboard |
| S-003 | **Reinicio completo del sistema** | 1. `docker compose down` en las 5 maquinas. 2. Arrancar de nuevo en orden: M3→M4→M5→M2→M1. | Todo vuelve a funcionar: replicacion, heartbeats, dashboard, LB, CB. | 5 min | Capturas de cada fase |

---

## 📋 Resumen de evidencias por tipo

| Tipo | Pruebas | Quien captura |
|---|---|---|
| 🖥️ **Captura de terminal** | P-001 a P-007, D-001 a D-005, R-001 a R-006, H-001 a H-003, F-003, F-005, C-001, C-003, C-006, C-007, S-001 a S-003 | Cada quien en su maquina |
| 🌐 **Captura de pantalla del dashboard** | H-004 a H-006, F-002, M-002, M-003, C-004 | Ana (M1 — proyecta) |
| 🎥 **VIDEO del dashboard en accion** | F-001, F-004, C-002, C-005 | Ana (M1 — graba pantalla) |

---

## 📝 Notas para la evidencia (importante para la calificación)

1. **Videos**: grabar la pantalla del dashboard completo, con audio narrando que se esta haciendo.
2. **Capturas de terminal**: deben mostrar el comando ejecutado y su salida. No recortar.
3. **Orden**: seguir la numeracion de los IDs. No saltarse pruebas.
4. **Si algo falla**: capturar el error igual — sirve como evidencia de lo que se intento y el comportamiento esperado vs real.

---

*Documento generado para la asignatura de Sistemas Distribuidos.*
