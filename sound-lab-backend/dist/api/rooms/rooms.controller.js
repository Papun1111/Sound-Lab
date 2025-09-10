import { createRoom, getRoomById, addVideoToQueue } from './rooms.service.js';
import { AppError } from '../../utils/AppError.js';
import { roomManager } from '../../socket/roomManager.js';
export const createRoomHandler = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.user?.userId;
        if (!ownerId) {
            throw new AppError('Authentication error, user not found.', 401);
        }
        const room = await createRoom(name, ownerId);
        res.status(201).json({ status: 'success', data: room });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getRoomByIdHandler = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId) {
            throw new AppError('Room ID is required.', 400);
        }
        const room = await getRoomById(roomId);
        res.status(200).json({ status: 'success', data: room });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const addVideoToQueueHandler = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { youtubeUrl } = req.body;
        const userId = req.user?.userId;
        const io = req.app.get('io');
        if (!roomId) {
            throw new AppError('Room ID is required in the URL.', 400);
        }
        if (!userId) {
            throw new AppError('Authentication error, user not found.', 401);
        }
        if (!youtubeUrl) {
            throw new AppError('YouTube URL is required.', 400);
        }
        // 1. Add video to the database
        const newVideo = await addVideoToQueue(roomId, youtubeUrl, userId);
        // 2. Update the live in-memory state
        roomManager.addVideo(roomId, {
            id: newVideo.id,
            youtubeId: newVideo.youtubeId,
            title: newVideo.title,
            duration: newVideo.duration,
            addedBy: newVideo.addedById,
        });
        // ✨ FIX: Check the live state *after* adding the video
        // This is a more reliable way to see if playback should start.
        const currentRoomState = roomManager.getRoomState(roomId);
        if (currentRoomState && !currentRoomState.currentlyPlaying && currentRoomState.queue.length === 1) {
            roomManager.startNextVideo(roomId);
        }
        // 3. Get the final, fully updated state and broadcast it
        const finalRoomState = roomManager.getRoomState(roomId);
        io.to(roomId).emit('room_state_update', finalRoomState);
        // 4. Send the API response
        res.status(201).json({ status: 'success', data: newVideo });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error('Error in addVideoToQueueHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
