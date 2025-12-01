// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/index');
const { pool } = require('./src/db');
const logger = require('./src/util/logger');
const eventBus = require('./src/events/eventBus');

const PORT = process.env.PORT || 4000;

async function start() {
  // Test DB connection
  try {
    await pool.query('SELECT 1');
    logger.info('DB connected');
  } catch (err) {
    logger.error('DB connection failed: ' + err.message);
    process.exit(1);
  }

  // create http server and attach socket.io
  const server = http.createServer(app);

  // Lazy require to avoid adding socket.io to backend package.json if not installed
  // but we expect socket.io to be installed. Use CORS to allow frontend origin (adjust for production)
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // broadcast location events to all clients
  eventBus.on('location', (payload) => {
    // payload: { vehicleId, prevZone, currentZone, lat, lon, ts }
    io.emit('location', payload);
    logger.debug('Broadcast location event for ' + payload.vehicleId);
  });

  // optional: handle client connections
  io.on('connection', (socket) => {
    logger.info('Socket connected: ' + socket.id);
    socket.on('disconnect', () => {
      logger.info('Socket disconnected: ' + socket.id);
    });
  });

  server.listen(PORT, () => {
    logger.info(`Server (HTTP + WS) running on port ${PORT}`);
  });
}

start();
