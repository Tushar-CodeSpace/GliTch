import { useState, useEffect, useRef, useCallback } from "react";

export interface TelemetryData {
  type: string;
  timestamp: number;
  time_iso: string;
  status: string;
  service: string;
  version: string;
  python_version: string;
  cpu_percent: number;
  ram_usage_gb: number;
  requests_per_sec: number;
  latency_ms: number;
  agents: Array<{
    id: string;
    name: string;
    site: string;
    ip: string;
    version: string;
    status: "ONLINE" | "PULLING" | "UPDATING" | "IDLE";
    lastSync: string;
    requestsPerSec: number;
  }>;
  http_log: {
    id: string;
    time: string;
    endpoint: string;
    status: string;
    latency: string;
  };
}

export interface HttpLogEntry {
  id: string;
  time: string;
  endpoint: string;
  status: string;
  latency: string;
}

export interface ItemEvent {
  type: "item_created" | "item_deleted";
  item?: any;
  item_id?: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "CONNECTED" | "RECONNECTING" | "DISCONNECTED">("CONNECTING");
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [wsLatency, setWsLatency] = useState<number | null>(null);
  const [trafficLogs, setTrafficLogs] = useState<HttpLogEntry[]>([]);
  
  // Callbacks / Event listeners registered by components
  const eventListenersRef = useRef<Array<(msg: any) => void>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pingStartTimeRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subscribeEvent = useCallback((listener: (msg: any) => void) => {
    eventListenersRef.current.push(listener);
    return () => {
      eventListenersRef.current = eventListenersRef.current.filter(l => l !== listener);
    };
  }, []);

  const sendEvent = useCallback((eventData: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(eventData));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

    setConnectionStatus("CONNECTING");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus("CONNECTED");

      // Start ping heartbeat for accurate WS latency tracking
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          pingStartTimeRef.current = performance.now();
          ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        }
      }, 2500);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "pong") {
          const roundtrip = Math.round(performance.now() - pingStartTimeRef.current);
          setWsLatency(roundtrip);
          return;
        }

        if (data.type === "telemetry_update") {
          setTelemetry(data);
          
          if (data.http_log) {
            setTrafficLogs(prev => {
              const exists = prev.some(l => l.id === data.http_log.id);
              if (exists) return prev;
              return [data.http_log, ...prev.slice(0, 24)];
            });
          }
        }

        // Notify external event listeners (e.g. item_created, item_deleted, approval_granted, etc.)
        eventListenersRef.current.forEach(listener => listener(data));
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectionStatus("RECONNECTING");
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      // Reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    connectionStatus,
    telemetry,
    wsLatency,
    trafficLogs,
    subscribeEvent,
    sendEvent,
    reconnect: connect
  };
}
