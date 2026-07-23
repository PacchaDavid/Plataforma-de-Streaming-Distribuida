import React, { useState, useEffect } from 'react';
import { API } from '../../App';

const TYPES = [
    { id: 'pelicula', label: '🎬 Películas', color: 'oklch(0.62 0.21 285)' },
    { id: 'serie', label: '📺 Series', color: 'oklch(0.72 0.19 315)' },
    { id: 'documental', label: '🌍 Documentales', color: 'oklch(0.62 0.18 155)' },
];

const GENRES = ['Ciencia Ficción', 'Fantasía', 'Naturaleza', 'Suspenso', 'Comedia', 'Drama', 'Acción', 'Aventura', 'Cocina'];

function Chip({ label, active, onClick, color }) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 16px',
            borderRadius: 20,
            border: '1px solid',
            borderColor: active ? (color || 'oklch(0.62 0.21 285 / 0.4)') : 'oklch(1 0 0 / 0.08)',
            background: active
                ? `linear-gradient(135deg, ${color || 'oklch(0.62 0.21 285)'}22, ${color || 'oklch(0.62 0.21 285)'}08)`
                : 'transparent',
            color: active ? '#fff' : 'oklch(0.55 0.01 265)',
            fontSize: 12,
            fontWeight: active ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            letterSpacing: '0.01em',
        }}
        onMouseEnter={e => { if (!active) { e.target.style.borderColor = 'oklch(1 0 0 / 0.2)'; e.target.style.color = '#fff'; }}}
        onMouseLeave={e => { if (!active) { e.target.style.borderColor = 'oklch(1 0 0 / 0.08)'; e.target.style.color = 'oklch(0.55 0.01 265)'; }}}
        >
            {label}
        </button>
    );
}

function ContentCard({ item }) {
    const typeInfo = TYPES.find(t => t.id === item.tipo) || TYPES[0];
    const stars = (r) => {
        const score = Math.round((r || 0) / 2);
        return '★'.repeat(score) + '☆'.repeat(5 - score);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))',
            borderRadius: 14,
            border: '1px solid oklch(1 0 0 / 0.08)',
            padding: 20,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'oklch(0.62 0.21 285 / 0.3)';
            e.currentTarget.style.boxShadow = '0 20px 60px oklch(0 0 0 / 0.4), 0 0 40px oklch(0.62 0.21 285 / 0.06)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.borderColor = 'oklch(1 0 0 / 0.08)';
            e.currentTarget.style.boxShadow = '';
        }}
        >
            {/* Accent bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${typeInfo.color}, ${typeInfo.color}66)`,
                opacity: 0.6,
            }} />

            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${typeInfo.color}33, ${typeInfo.color}11)`,
                border: `1px solid ${typeInfo.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 14,
            }}>
                {item.tipo === 'pelicula' ? '🎬' : item.tipo === 'serie' ? '📺' : '🌍'}
            </div>

            <h3 style={{
                fontSize: 15, fontWeight: 600,
                marginBottom: 4, lineHeight: 1.3,
                letterSpacing: '-0.01em',
            }}>{item.titulo}</h3>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, color: 'oklch(0.5 0.01 265)',
                marginBottom: 10,
            }}>
                <span style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: 'oklch(1 0 0 / 0.06)',
                    border: '1px solid oklch(1 0 0 / 0.06)',
                }}>{item.genero}</span>
                <span>·</span>
                <span>{item.anioLanzamiento}</span>
                <span>·</span>
                <span>{item.duracionMin} min</span>
            </div>

            <p style={{
                fontSize: 13, color: 'oklch(0.55 0.01 265)',
                lineHeight: 1.5, marginBottom: 12,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
            }}>{item.descripcion}</p>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'oklch(0.8 0.15 75)',
            }}>
                <span style={{ letterSpacing: '0.05em' }}>{stars(item.rating || 0)}</span>
                <span style={{ fontSize: 11, color: 'oklch(0.5 0.01 265)' }}>
                    {item.rating?.toFixed(1) || '0.0'}
                </span>
            </div>
        </div>
    );
}

export default function Catalogo() {
    const [contenido, setContenido] = useState([]);
    const [filter, setFilter] = useState('todo');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
        fetch(`${API}/recomendaciones/contenido`)
            .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
            .then(data => { setContenido(data); setLoading(false); })
            .catch(() => { setLoading(false); setError(true); });
    }, []);

    const activeColor = filter === 'todo' ? 'oklch(0.62 0.21 285)' :
        TYPES.find(t => t.id === filter)?.color || 'oklch(0.62 0.21 285)';

    const filtered = filter === 'todo'
        ? contenido
        : contenido.filter(c => c.tipo === filter || c.genero === filter);

    return (
        <div>
            {/* Filter chips */}
            <div style={{
                display: 'flex', gap: 6, flexWrap: 'wrap',
                marginBottom: 24, paddingBottom: 20,
                borderBottom: '1px solid oklch(1 0 0 / 0.06)',
            }}>
                <Chip label="🔥 Todo" active={filter === 'todo'} onClick={() => setFilter('todo')} color="oklch(0.62 0.21 285)" />
                {TYPES.map(t => (
                    <Chip key={t.id} label={t.label} active={filter === t.id} onClick={() => setFilter(t.id)} color={t.color} />
                ))}
                <div style={{ width: 1, background: 'oklch(1 0 0 / 0.08)', margin: '0 8px' }} />
                {GENRES.map(g => (
                    <Chip key={g} label={g} active={filter === g} onClick={() => setFilter(g)} />
                ))}
            </div>

            {/* Content grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} style={{
                            height: 260, borderRadius: 14,
                            background: 'linear-gradient(135deg, oklch(1 0 0 / 0.04), oklch(1 0 0 / 0.02))',
                            border: '1px solid oklch(1 0 0 / 0.06)',
                            animation: 'pulse-glow 2s infinite',
                        }} />
                    ))}
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'oklch(0.62 0.22 25)', fontSize: 14 }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>⚠️</span>
                    No se pudo conectar con el API. Verifica que el gateway esté funcionando.
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'oklch(0.45 0.01 265)', fontSize: 14 }}>
                    No hay contenido para este filtro
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 20,
                }}>
                    {filtered.map((c, i) => (
                        <div key={c.id} style={{ animationDelay: `${(i % 12) * 60}ms` }}>
                            <ContentCard item={c} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
