import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebSocket(url) {
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const maxMessages = 200;

    const connect = useCallback(() => {
        if (!url) return;
        try {
            const ws = new WebSocket(url);
            ws.onopen = () => {
                setConnected(true);
                console.log('[WS] Conectado a', url);
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages(prev => {
                        const next = [...prev, { ...data, _time: Date.now() }];
                        return next.length > maxMessages ? next.slice(-maxMessages) : next;
                    });
                } catch (e) {
                    // ignore non-JSON messages
                }
            };
            ws.onclose = () => {
                setConnected(false);
                console.log('[WS] Desconectado, reconectando en 3s...');
                setTimeout(connect, 3000);
            };
            ws.onerror = () => ws.close();
            wsRef.current = ws;
        } catch (e) {
            console.error('[WS] Error de conexión:', e);
            setTimeout(connect, 5000);
        }
    }, [url]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    // Get latest heartbeat per node/service
    const getLatestHeartbeats = useCallback(() => {
        const heartbeats = {};
        messages.forEach(msg => {
            if (msg.type === 'heartbeat' && msg.payload?.status === 'UP') {
                const key = msg.source || msg.payload?.machine_id || 'unknown';
                const service = msg.payload?.servicio || 'unknown';
                if (!heartbeats[key]) heartbeats[key] = {};
                heartbeats[key][service] = msg._time;
            }
        });
        return heartbeats;
    }, [messages]);

    // Get latest circuit breaker states
    const getCircuitStates = useCallback(() => {
        const states = {};
        messages.forEach(msg => {
            if (msg.type === 'circuit_state' && msg.payload?.node) {
                states[msg.payload.node] = {
                    state: msg.payload.state,
                    reason: msg.payload.reason,
                    timestamp: msg.timestamp,
                };
            }
        });
        return states;
    }, [messages]);

    // Get latest replication status
    const getReplicationStatus = useCallback(() => {
        const status = {};
        messages.forEach(msg => {
            if (msg.type === 'replication_status' && msg.payload?.node) {
                status[msg.payload.node] = {
                    size: msg.payload.wsrep_cluster_size,
                    comment: msg.payload.wsrep_local_state_comment,
                    ready: msg.payload.wsrep_ready,
                    timestamp: msg.timestamp,
                };
            }
        });
        return status;
    }, [messages]);

    return { messages, connected, getLatestHeartbeats, getCircuitStates, getReplicationStatus };
}
