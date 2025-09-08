import { io, Socket } from 'socket.io-client';

// Get the backend WebSocket URL from environment variables
const URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';

// A variable to hold the socket instance to prevent multiple connections
let socket: Socket | null = null;


export const getSocket = (token: string): Socket => {
  // If a socket instance doesn't exist, create one
  if (!socket) {
    socket = io(URL, {
      // Send the token for authentication by the backend middleware
      auth: {
        token,
      },
      // Important: prevent automatic connection on initialization
      autoConnect: false,
    });
  }

  // If the socket exists but is disconnected (e.g., after logout), update its auth token
  if (!socket.connected) {
      socket.auth = { token };
  }

  return socket;
};

/**
 * Disconnects the socket instance.
 * This should be called on user logout.
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null; // Clear the instance
  }
};