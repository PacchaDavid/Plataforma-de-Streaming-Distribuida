import React, { useRef, useEffect } from 'react';

const EVENT_CONFIG = {
    heartbeat: { color: 'oklch(0.62 0.18 155)', icon: '💓', label: 'Heartbeat' },
    circuit_state: { color: 'oklch(0.62 0.21 285)', icon: '⚡', label: 'Circuit Breaker' },
    replication_status: { color: 'oklch(0.72 0.19 315)', icon: '🗄️', label: 'Replicación' },
};

export default function Timeline({ messages, recent }) {
    const bottomRef = useRef(null);
    const display = (recent || messages).slice(-60).reverse();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const formatTime = (ts) => {
        if (!ts) return '';
        try {
            const d = new Date(ts);
            return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            if (typeof ts === 'number') {
                const d = new Date(ts);
                return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            return '';
        }
    };

    const getDesc = (msg) => {
        switch (msg.type) {
            case 'heartbeat':
                return `${msg.payload?.servicio || '?'} — ${msg.payload?.status || '?'}`;
            case 'circuit_state':
                return `${msg.payload?.node || '?'} → ${msg.payload?.state || '?'}`;
            case 'replication_status':
                return `${msg.payload?.node || '?'} — ${msg.payload?.wsrep_local_state_comment || '?'}`;
            default:
                return JSON.stringify(msg.payload || '').substring(0, 60);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))',
            borderRadius: 14,
            border: '1px solid oklch(1 0 0 / 0.08)',
            padding: 20,
            animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}>
            <h3 style={{
                fontSize: 14, fontWeight: 600, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <span>📋</span> Timeline de Eventos
                <span style={{
                    fontSize: 10, color: 'oklch(0.45 0.01 265)', fontWeight: 400,
                    marginLeft: 8, padding: '2px 8px', borderRadius: 6,
                    background: 'oklch(1 0 0 / 0.04)',
                }}>
                    Últimos {display.length}
                </span>
            </h3>

            <div style={{
                maxHeight: 360, overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 3,
            }}>
                {display.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: 32,
                        color: 'oklch(0.45 0.01 265)', fontSize: 13,
                    }}>
                        Esperando eventos... Los heartbeats y cambios aparecerán aquí automáticamente.
                    </div>
                ) : (
                    display.map((msg, i) => {
                        const cfg = EVENT_CONFIG[msg.type] || { color: 'oklch(0.5 0.01 265)', icon: '📌' };
                        const time = formatTime(msg.timestamp || msg._time);

                        return (
                            <div key={`${i}-${msg._time || i}`} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '7px 12px', borderRadius: 8,
                                background: i === 0 ? `${cfg.color}08` : 'transparent',
                                border: '1px solid',
                                borderColor: i === 0 ? `${cfg.color}15` : 'transparent',
                                fontSize: 12,
                                animation: i < 5 ? 'slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'oklch(1 0 0 / 0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? `${cfg.color}08` : 'transparent'; }}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                                <span style={{
                                    color: 'oklch(0.45 0.01 265)', width: 65, flexShrink: 0,
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                                }}>
                                    {time}
                                </span>
                                <span style={{
                                    padding: '1px 6px', borderRadius: 4,
                                    background: `${cfg.color}15`,
                                    color: cfg.color, fontSize: 10, fontWeight: 500,
                                    flexShrink: 0,
                                }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                                <span style={{ color: 'oklch(0.6 0.01 265)', fontSize: 12, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getDesc(msg)}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
