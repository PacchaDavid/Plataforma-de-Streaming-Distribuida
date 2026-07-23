import React from 'react';

export default function ReplicacionStatus({ status }) {
    const entries = Object.entries(status);
    const maxSize = Math.max(...entries.map(([, v]) => parseInt(v.size || '0')), 0);
    const allSynced = entries.every(([, v]) => v.comment === 'Synced');
    const ringColor = allSynced ? 'oklch(0.62 0.18 155)' : maxSize > 0 ? 'oklch(0.75 0.19 65)' : 'oklch(0.62 0.22 25)';

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
                <span>🗄️</span> Replicación Galera
            </h3>

            {entries.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 20,
                    color: 'oklch(0.45 0.01 265)', fontSize: 13,
                }}>
                    Esperando datos de replicación...
                </div>
            ) : (
                <>
                    {/* Cluster ring indicator */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 20, marginBottom: 16,
                    }}>
                        <div style={{
                            position: 'relative',
                            width: 72, height: 72, borderRadius: '50%',
                            background: `conic-gradient(${ringColor} ${maxSize * 120}deg, oklch(1 0 0 / 0.06) 0deg)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'oklch(0.12 0.02 265)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: 20, fontWeight: 700, color: ringColor, lineHeight: 1 }}>{maxSize}</span>
                                <span style={{ fontSize: 10, color: 'oklch(0.5 0.01 265)' }}>/ 3</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                                {allSynced ? '✅ Cluster sincronizado' : maxSize > 0 ? '⚠️ Sincronización parcial' : '❌ Cluster caído'}
                            </div>
                            <div style={{ fontSize: 11, color: 'oklch(0.5 0.01 265)' }}>
                                {maxSize}/3 nodos en el cluster
                            </div>
                        </div>
                    </div>

                    {/* Node list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {entries.map(([node, info]) => {
                            const synced = info.comment === 'Synced';
                            return (
                                <div key={node} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', borderRadius: 10,
                                    background: synced ? 'oklch(0.62 0.18 155 / 0.04)' : 'oklch(0.62 0.22 25 / 0.04)',
                                    border: '1px solid',
                                    borderColor: synced ? 'oklch(0.62 0.18 155 / 0.12)' : 'oklch(0.62 0.22 25 / 0.12)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: synced ? 'oklch(0.62 0.18 155)' : 'oklch(0.62 0.22 25)',
                                            boxShadow: synced ? '0 0 8px oklch(0.62 0.18 155 / 0.4)' : 'none',
                                        }} />
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{node}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 11, color: 'oklch(0.5 0.01 265)' }}>
                                            Size: {info.size || '?'}
                                        </span>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 10,
                                            fontSize: 10, fontWeight: 600,
                                            background: synced ? 'oklch(0.62 0.18 155 / 0.15)' : 'oklch(0.62 0.22 25 / 0.15)',
                                            color: synced ? 'oklch(0.62 0.18 155)' : 'oklch(0.62 0.22 25)',
                                            border: '1px solid',
                                            borderColor: synced ? 'oklch(0.62 0.18 155 / 0.2)' : 'oklch(0.62 0.22 25 / 0.2)',
                                        }}>
                                            {info.comment || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
