import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyJwt } from '../utils/jwt.js';
import { roomManager } from './roomManager.js';
import config from '../config/index.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
  };
}

export const initializeSocketIO = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }
    try {
      const decoded = verifyJwt(token) as { userId: string };
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.user = { userId: decoded.userId };
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    socket.on('join_room', (roomId: string) => {
      if (!socket.user) return;
      socket.join(roomId);
      roomManager.joinRoom(roomId, socket.user.userId, socket.id);
      const updatedState = roomManager.getRoomState(roomId);
      io.to(roomId).emit('room_state_update', updatedState);
    });

    socket.on('new_video_added', ({ roomId, videoData }) => {
      if (!socket.user) return;
      roomManager.addVideo(roomId, videoData);
      const updatedState = roomManager.getRoomState(roomId);
      io.to(roomId).emit('room_state_update', updatedState);
    });

    socket.on('vote_video', ({ roomId, videoId }: { roomId: string; videoId: string }) => {
      if (!socket.user) return;
      roomManager.voteForVideo(roomId, socket.user.userId, videoId);
      const updatedState = roomManager.getRoomState(roomId);
      io.to(roomId).emit('room_state_update', updatedState);
    });

    socket.on('request_next_video', (roomId: string) => {
      if (!socket.user) return;
      roomManager.startNextVideo(roomId);
      const updatedState = roomManager.getRoomState(roomId);
      io.to(roomId).emit('room_state_update', updatedState);
    });

    socket.on('disconnect', () => {
      const room = roomManager.leaveRoom(socket.id);
      if (room) {
        const updatedState = roomManager.getRoomState(room.id);
        io.to(room.id).emit('room_state_update', updatedState);
      }
    });
  });

  return io;
};