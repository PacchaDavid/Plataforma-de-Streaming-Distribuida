import React from 'react';

const SERVICE_ICONS = { usuarios: '👤', recomendaciones: '🎯', pagos: '💳' };
const SERVICE_COLORS = { usuarios: 'oklch(0.62 0.21 285)', recomendaciones: 'oklch(0.72 0.19 315)', pagos: 'oklch(0.62 0.18 155)' };

export default function NodoCard({ node, label, services }) {
    const allUp = Object.values(services).every(v => v === true);
    const anyUp = Object.values(services).some(v => v === true);
    const status = allUp ? 'UP' : anyUp ? 'DEGRADED' : 'DOWN';

    const statusConfig = {
        UP: { color: 'oklch(0.62 0.18 155)', label: 'UP', bg: 'oklch(0.62 0.18 155 / 0.1)', border: 'oklch(0.62 0.18 155 / 0.2)' },
        DEGRADED: { color: 'oklch(0.75 0.19 65)', label: 'DEGRADED', bg: 'oklch(0.75 0.19 65 / 0.1)', border: 'oklch(0.75 0.19 65 / 0.2)' },
        DOWN: { color: 'oklch(0.62 0.22 25)', label: 'DOWN', bg: 'oklch(0.62 0.22 25 / 0.1)', border: 'oklch(0.62 0.22 25 / 0.2)' },
    };
    const cfg = statusConfig[status];

    return (
        <div style={{
            background: 'linear-gradient(135deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))',
            borderRadius: 14,
            border: '1px solid',
            borderColor: cfg.border,
            padding: 20,
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = `0 8px 32px ${cfg.color}11`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{label}</h3>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'oklch(0.45 0.01 265)' }}>{node}</span>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 20,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: cfg.color,
                        boxShadow: status === 'UP' ? `0 0 10px ${cfg.color}` : 'none',
                        animation: status === 'UP' ? 'pulse-glow 2s infinite' : 'none',
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(services).map(([service, isUp]) => {
                    const color = SERVICE_COLORS[service] || 'oklch(0.5 0.01 265)';
                    return (
                        <div key={service} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px', borderRadius: 10,
                            background: isUp ? 'oklch(0.62 0.18 155 / 0.04)' : 'oklch(0.62 0.22 25 / 0.04)',
                            border: '1px solid',
                            borderColor: isUp ? 'oklch(0.62 0.18 155 / 0.12)' : 'oklch(0.62 0.22 25 / 0.12)',
                            transition: 'all 0.2s ease',
                        }}>
                            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{SERVICE_ICONS[service]}</span>
                                <span style={{ fontWeight: 500 }}>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                            </span>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: isUp ? 'oklch(0.62 0.18 155)' : 'oklch(0.62 0.22 25)',
                                boxShadow: isUp ? '0 0 8px oklch(0.62 0.18 155 / 0.5)' : 'none',
                                transition: 'all 0.3s ease',
                            }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
