import { Server } from 'socket.io';
import { verifyJwt } from '../utils/jwt.js';
import { roomManager } from './roomManager.js';
import config from '../config/index.js';
export const initializeSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: config.corsOrigin,
            methods: ['GET', 'POST'],
        },
    });
    // Authentication Middleware for Sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token not provided.'));
        }
        try {
            const decoded = verifyJwt(token);
            if (!decoded) {
                return next(new Error('Authentication error: Invalid token.'));
            }
            socket.user = { userId: decoded.userId };
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid token.'));
        }
    });
    io.on('connection', (socket) => {
        // --- JOIN & LEAVE LOGIC ---
        socket.on('join_room', (roomId) => {
            if (!socket.user)
                return;
            socket.join(roomId);
            roomManager.joinRoom(roomId, socket.user.userId, socket.id);
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
        // --- PLAYBACK LOGIC ---
        socket.on('request_next_video', (roomId) => {
            if (!socket.user)
                return;
            roomManager.startNextVideo(roomId);
            const updatedState = roomManager.getRoomState(roomId);
            io.to(roomId).emit('room_state_update', updatedState);
        });
        // ✨ NEW LISTENER FOR REAL-TIME SYNC ✨
        // This handles play, pause, and seek events from clients.
        socket.on('playback_change', (roomId, newState) => {
            if (!socket.user)
                return;
            // 1. Update the playback state on the server using the roomManager.
            roomManager.updatePlaybackState(roomId, newState);
            // 2. Broadcast this change to all OTHER clients in the room.
            // Using `socket.to(roomId)` is crucial to prevent sending the event
            // back to the user who triggered it, which would cause an echo effect.
            socket.to(roomId).emit('room_state_update', { currentlyPlaying: newState });
        });
        // --- VOTING LOGIC ---
        socket.on('vote_video', ({ roomId, videoId }) => {
            if (!socket.user)
                return;
            roomManager.voteForVideo(roomId, socket.user.userId, videoId);
            const updatedState = roomManager.getRoomState(roomId);
            io.to(roomId).emit('room_state_update', updatedState);
        });
    });
    return io;
};
