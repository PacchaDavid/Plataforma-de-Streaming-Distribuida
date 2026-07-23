import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Catalogo from './views/usuario/Catalogo';
import Dashboard from './views/dashboard/Dashboard';

const API = process.env.REACT_APP_API_URL || 'http://192.168.1.12:8000/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://192.168.1.12:8000/ws/monitor';

export { API, WS_URL };

function NavLink({ to, children, isActive }) {
    return (
        <Link to={to} style={{
            position: 'relative',
            color: isActive ? '#fff' : 'oklch(0.6 0.01 265)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            padding: '8px 16px',
            borderRadius: 8,
            background: isActive ? 'oklch(0.62 0.21 285 / 0.12)' : 'transparent',
            border: '1px solid',
            borderColor: isActive ? 'oklch(0.62 0.21 285 / 0.2)' : 'transparent',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            letterSpacing: '0.01em',
        }}
        onMouseEnter={e => { if (!isActive) { e.target.style.color = '#fff'; e.target.style.background = 'oklch(1 0 0 / 0.05)'; }}}
        onMouseLeave={e => { if (!isActive) { e.target.style.color = 'oklch(0.6 0.01 265)'; e.target.style.background = 'transparent'; }}}
        >
            {children}
        </Link>
    );
}

function Navbar() {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: scrolled
                ? 'oklch(0.08 0.02 265 / 0.85)'
                : 'oklch(0.08 0.02 265 / 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid',
            borderColor: scrolled ? 'oklch(1 0 0 / 0.08)' : 'oklch(1 0 0 / 0.04)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, oklch(0.62 0.21 285), oklch(0.72 0.19 315))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#fff',
                        boxShadow: '0 4px 12px oklch(0.62 0.21 285 / 0.3)',
                    }}>S</span>
                    <span style={{
                        fontWeight: 700, fontSize: 16,
                        background: 'linear-gradient(135deg, oklch(0.7 0.15 285), oklch(0.8 0.15 315))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>StreamDist</span>
                </Link>
                <div style={{ display: 'flex', gap: 4 }}>
                    <NavLink to="/" isActive={location.pathname === '/'}>Inicio</NavLink>
                    <NavLink to="/dashboard" isActive={location.pathname === '/dashboard'}>Dashboard</NavLink>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'oklch(0.62 0.18 155)',
                    boxShadow: '0 0 8px oklch(0.62 0.18 155 / 0.5)',
                }} />
                <span style={{ fontSize: 11, color: 'oklch(0.5 0.01 265)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Sistemas Distribuidos
                </span>
            </div>
        </nav>
    );
}

function Hero() {
    return (
        <div style={{
            textAlign: 'center',
            padding: '48px 24px 32px',
            animation: 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}>
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 14px', borderRadius: 20,
                background: 'oklch(0.62 0.21 285 / 0.1)',
                border: '1px solid oklch(0.62 0.21 285 / 0.2)',
                fontSize: 11, fontWeight: 600, color: 'oklch(0.7 0.15 285)',
                marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.62 0.21 285)', display: 'inline-block' }} />
                Demo — Sistemas Distribuidos
            </span>
            <h1 style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 12,
                background: 'linear-gradient(135deg, oklch(0.96 0.01 95), oklch(0.7 0.15 285))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                Streaming Distribuido
            </h1>
            <p style={{
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                color: 'oklch(0.55 0.01 265)',
                maxWidth: 560, margin: '0 auto',
                lineHeight: 1.6,
                fontWeight: 400,
            }}>
                Catálogo con balanceo de carga, circuit breaker y replicación multi-maestro en tiempo real
            </p>
        </div>
    );
}

function Home() {
    return (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
            <Hero />
            <Catalogo />
        </div>
    );
}

export default function App() {
    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Grain texture overlay */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
                opacity: 0.015,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
    );
}
