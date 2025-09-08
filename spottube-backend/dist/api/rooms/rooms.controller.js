import { createRoom, getRoomById, addVideoToQueue } from './rooms.service.js';
import { AppError } from '../../utils/AppError.js';
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
        // ✨ FIX: Check if roomId exists before using it.
        if (!roomId) {
            throw new AppError('Room ID is required in the URL.', 400);
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
        // ✨ FIX: Check if roomId exists before using it.
        if (!roomId) {
            throw new AppError('Room ID is required in the URL.', 400);
        }
        if (!userId) {
            throw new AppError('Authentication error, user not found.', 401);
        }
        if (!youtubeUrl) {
            throw new AppError('YouTube URL is required.', 400);
        }
        const newVideo = await addVideoToQueue(roomId, youtubeUrl, userId);
        res.status(201).json({ status: 'success', data: newVideo });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
