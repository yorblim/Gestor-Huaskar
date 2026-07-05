import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

const clientTopics = new Map<WebSocket, Set<string>>();
const TOPIC_ALL = "*";

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);
    clientTopics.set(ws, new Set([TOPIC_ALL]));

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe" && Array.isArray(msg.topics)) {
          const topics = clientTopics.get(ws);
          if (topics) {
            for (const t of msg.topics) topics.add(t);
          }
        }
        if (msg.type === "unsubscribe" && Array.isArray(msg.topics)) {
          const topics = clientTopics.get(ws);
          if (topics) {
            for (const t of msg.topics) topics.delete(t);
          }
        }
      } catch {
        // ignore invalid messages
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      clientTopics.delete(ws);
    });
  });

  checkLowStock();
  setInterval(checkLowStock, 30000);
}

async function checkLowStock() {
  try {
    const { prisma } = await import("../../lib/prisma");
    const products = await prisma.product.findMany({
      select: { id: true, name: true, stock: true, minStock: true },
    });

    const lowStock = products.filter((p) => p.stock <= p.minStock);
    if (lowStock.length > 0) {
      broadcast({
        type: "low_stock",
        data: lowStock,
        count: lowStock.length,
      });
    }
  } catch {
    // Silently fail
  }
}

export function broadcast(message: any) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function emitToTopic(topic: string, message: any) {
  const data = JSON.stringify(message);
  for (const [client, topics] of clientTopics) {
    if (client.readyState === WebSocket.OPEN && (topics.has(topic) || topics.has(TOPIC_ALL))) {
      client.send(data);
    }
  }
}

export function emitEvent(type: string, payload?: any) {
  emitToTopic(type, { type, data: payload, timestamp: new Date().toISOString() });
}
