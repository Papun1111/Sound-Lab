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
        // ✨ THIS IS THE NEWLY ADDED LOGIC ✨
        // Listens for a message from a client player when its video ends.
        socket.on('request_next_video', (roomId) => {
            if (!socket.user)
                return;
            // Tell the room manager to advance the queue
            roomManager.startNextVideo(roomId);
            // Get the new state with the new `currentlyPlaying` video
            const updatedState = roomManager.getRoomState(roomId);
            // Broadcast the new state to everyone in the room
            io.to(roomId).emit('room_state_update', updatedState);
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
