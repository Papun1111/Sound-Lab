import http from 'http';
import app from './app.js';
import config from './config/index.js';
import { initializeSocketIO } from './socket/socket.js';

const PORT = config.port;

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = initializeSocketIO(server);

// ✨ ADD THIS LINE:
// This stores the `io` instance on the Express app object, making it globally accessible.
app.set('io', io);

// Start listening for incoming connections
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server is ready.`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
