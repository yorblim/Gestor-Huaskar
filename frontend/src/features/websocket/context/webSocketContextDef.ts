import { createContext } from "react";

export interface WsEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketContextValue {
  connected: boolean;
  lastEvent: WsEvent | null;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
  on: (eventType: string, handler: (event: WsEvent) => void) => () => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);
