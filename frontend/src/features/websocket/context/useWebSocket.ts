import { useContext } from "react";
import { WebSocketContext } from "./webSocketContextDef";

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be inside WebSocketProvider");
  return ctx;
}
