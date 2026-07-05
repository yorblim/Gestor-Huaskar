import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { initWebSocket } from "./modules/notifications/notifications.service";

dotenv.config();

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET no definido. El servidor no puede iniciar sin una clave secreta.");
  process.exit(1);
}

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
