import React from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import NodoCard from './NodoCard';
import CircuitBreakerStatus from './CircuitBreakerStatus';
import ReplicacionStatus from './ReplicacionStatus';
import Timeline from './Timeline';
import StatusBar from './StatusBar';
import { WS_URL } from '../../App';

const NODES = ['192.168.1.13', '192.168.1.14', '192.168.1.15'];
const NODE_LABELS = { '192.168.1.13': 'Nodo 3 (Pepito)', '192.168.1.14': 'Nodo 4 (Juan)', '192.168.1.15': 'Nodo 5 (José)' };
const SERVICES = ['usuarios', 'recomendaciones', 'pagos'];
const HEARTBEAT_TIMEOUT_MS = 6000;

export default function Dashboard() {
    const { messages, connected, getLatestHeartbeats, getCircuitStates, getReplicationStatus } = useWebSocket(WS_URL);

    const heartbeats = getLatestHeartbeats();
    const circuitStates = getCircuitStates();
    const replicationStatus = getReplicationStatus();
    const now = Date.now();

    const nodeHealth = {};
    let totalUp = 0, totalServices = 0;
    NODES.forEach(node => {
        const nodeId = node.split('.').pop();
        const hb = heartbeats[nodeId] || {};
        const services = {};
        SERVICES.forEach(service => {
            totalServices++;
            const lastTime = hb[service];
            const isUp = lastTime && (now - lastTime) < HEARTBEAT_TIMEOUT_MS;
            services[service] = isUp || false;
            if (isUp) totalUp++;
        });
        nodeHealth[node] = services;
    });

    const cbOpen = Object.values(circuitStates).filter(s => s.state === 'OPEN').length;
    const repSize = Math.max(0, ...Object.values(replicationStatus).map(v => parseInt(v.size || '0')));

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24,
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'clamp(22px, 2.5vw, 28px)',
                        fontWeight: 700, letterSpacing: '-0.02em',
                        marginBottom: 4,
                    }}>
                        📊 Dashboard
                    </h1>
                    <p style={{ fontSize: 13, color: 'oklch(0.5 0.01 265)' }}>
                        Monitoreo en tiempo real del sistema distribuido
                    </p>
                </div>
                <StatusBar connected={connected} totalUp={totalUp} totalServices={totalServices} />
            </div>

            {/* Metrics row */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12, marginBottom: 24,
            }}>
                <MetricCard label="Nodos" value="3" sub="totales" color="oklch(0.62 0.21 285)" />
                <MetricCard label="Servicios UP" value={`${totalUp}/${totalServices}`} sub="heartbeats activos" color={totalUp === totalServices ? 'oklch(0.62 0.18 155)' : 'oklch(0.75 0.19 65)'} />
                <MetricCard label="Circuit Breaker" value={cbOpen > 0 ? `${cbOpen} OPEN` : '0 OPEN'} sub={cbOpen > 0 ? '⚠️ Atención' : '✅ Todo normal'} color={cbOpen > 0 ? 'oklch(0.62 0.22 25)' : 'oklch(0.62 0.18 155)'} />
                <MetricCard label="Cluster Galera" value={`${repSize}/3`} sub={repSize >= 3 ? 'Sincronizado' : 'Parcial'} color={repSize >= 3 ? 'oklch(0.62 0.18 155)' : 'oklch(0.75 0.19 65)'} />
            </div>

            {/* Nodes row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {NODES.map(node => (
                    <NodoCard
                        key={node}
                        node={node}
                        label={NODE_LABELS[node]}
                        services={nodeHealth[node] || {}}
                    />
                ))}
            </div>

            {/* Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <CircuitBreakerStatus states={circuitStates} />
                <ReplicacionStatus status={replicationStatus} />
            </div>

            <Timeline messages={messages} recent={messages.slice(-100)} />
        </div>
    );
}

function MetricCard({ label, value, sub, color }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))',
            borderRadius: 12,
            border: '1px solid oklch(1 0 0 / 0.08)',
            padding: '14px 18px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                background: `linear-gradient(180deg, ${color}, ${color}44)`,
                borderRadius: '3px 0 0 3px',
            }} />
            <div style={{ fontSize: 11, color: 'oklch(0.5 0.01 265)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'oklch(0.45 0.01 265)', marginTop: 2 }}>{sub}</div>
        </div>
    );
}
