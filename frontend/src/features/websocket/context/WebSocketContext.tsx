import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { WebSocketContext, type WsEvent } from "./webSocketContextDef";

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3000/ws`;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(event: WsEvent) => void>>>(new Map());
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (msg) => {
      try {
        const event: WsEvent = JSON.parse(msg.data);
        setLastEvent(event);

        const handlers = handlersRef.current.get(event.type);
        if (handlers) {
          for (const handler of handlers) {
            handler(event);
          }
        }

        const wildcardHandlers = handlersRef.current.get("*");
        if (wildcardHandlers) {
          for (const handler of wildcardHandlers) {
            handler(event);
          }
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => {
        connectRef.current();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const subscribe = useCallback((topic: string) => {
    send({ type: "subscribe", topics: [topic] });
  }, [send]);

  const unsubscribe = useCallback((topic: string) => {
    send({ type: "unsubscribe", topics: [topic] });
  }, [send]);

  const on = useCallback((eventType: string, handler: (event: WsEvent) => void) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);
    return () => { handlersRef.current.get(eventType)?.delete(handler); };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, lastEvent, subscribe, unsubscribe, on }}>
      {children}
    </WebSocketContext.Provider>
  );
}
