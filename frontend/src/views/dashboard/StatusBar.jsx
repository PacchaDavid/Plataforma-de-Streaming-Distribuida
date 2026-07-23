import React from 'react';

export default function StatusBar({ connected, totalUp, totalServices }) {
    const allHealthy = connected && totalUp === totalServices;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '10px 18px', borderRadius: 12,
            background: allHealthy
                ? 'oklch(0.62 0.18 155 / 0.06)'
                : 'oklch(0.75 0.19 65 / 0.06)',
            border: '1px solid',
            borderColor: allHealthy
                ? 'oklch(0.62 0.18 155 / 0.15)'
                : 'oklch(0.75 0.19 65 / 0.15)',
        }}>
            {/* Connection indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: connected ? 'oklch(0.62 0.18 155)' : 'oklch(0.62 0.22 25)',
                    boxShadow: connected ? '0 0 12px oklch(0.62 0.18 155 / 0.5)' : 'none',
                    animation: connected ? 'pulse-glow 2s infinite' : 'none',
                }} />
                <span style={{ fontSize: 12, color: 'oklch(0.55 0.01 265)', fontWeight: 500 }}>
                    {connected ? 'Conectado' : 'Desconectado'}
                </span>
            </div>

            <div style={{ width: 1, height: 20, background: 'oklch(1 0 0 / 0.08)' }} />

            {/* Health summary */}
            <div style={{ fontSize: 12, color: 'oklch(0.55 0.01 265)' }}>
                <span style={{ fontWeight: 600, color: totalUp === totalServices ? 'oklch(0.62 0.18 155)' : 'oklch(0.75 0.19 65)' }}>
                    {totalUp}/{totalServices}
                </span> servicios activos
            </div>
        </div>
    );
}
