import React from 'react';

const STATE_CONFIG = {
    CLOSED: { color: 'oklch(0.62 0.18 155)', label: 'CLOSED', icon: '✅', desc: 'Tráfico normal' },
    OPEN: { color: 'oklch(0.62 0.22 25)', label: 'OPEN', icon: '🔴', desc: 'Sin tráfico' },
    HALF_OPEN: { color: 'oklch(0.75 0.19 65)', label: 'HALF_OPEN', icon: '🟡', desc: 'Petición de prueba' },
};

export default function CircuitBreakerStatus({ states }) {
    const entries = Object.entries(states);
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
                <span>⚡</span> Circuit Breaker
            </h3>

            {entries.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 20,
                    color: 'oklch(0.45 0.01 265)', fontSize: 13,
                }}>
                    Esperando datos del Circuit Breaker...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {entries.map(([node, info]) => {
                        const cfg = STATE_CONFIG[info.state] || STATE_CONFIG.CLOSED;
                        return (
                            <div key={node} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: 10,
                                background: `${cfg.color}08`,
                                border: `1px solid ${cfg.color}22`,
                                transition: 'all 0.3s ease',
                                animation: 'slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{node}</div>
                                    {info.reason && (
                                        <span style={{
                                            fontSize: 11, color: 'oklch(0.5 0.01 265)',
                                            padding: '2px 8px', borderRadius: 6,
                                            background: 'oklch(1 0 0 / 0.04)',
                                        }}>
                                            {info.reason === 'cooldown_expired' ? '⏳ Cooldown expirado' :
                                             info.reason === 'recovered' ? '✅ Recuperado' :
                                             info.reason === 'high_latency' ? '🐢 Latencia alta' :
                                             info.reason === 'timeout' ? '⏰ Timeout' :
                                             info.reason === '5xx' ? '❌ Error 5xx' : info.reason}
                                        </span>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        padding: '4px 12px', borderRadius: 20,
                                        background: `${cfg.color}15`,
                                        border: `1px solid ${cfg.color}33`,
                                        fontSize: 11, fontWeight: 600, color: cfg.color,
                                    }}>
                                        <span>{cfg.icon}</span> {cfg.label}
                                    </span>
                                    <div style={{ fontSize: 10, color: 'oklch(0.45 0.01 265)', marginTop: 4 }}>
                                        {cfg.desc}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
