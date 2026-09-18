import http from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { initWebSocket } from "./modules/notifications/notifications.service";

const server = http.createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => {
  logger.info(`Servidor ejecutándose en http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
