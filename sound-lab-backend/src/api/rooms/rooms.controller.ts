import { Request, Response } from 'express';
import { createRoom, getRoomById, addVideoToQueue } from './rooms.service.js';
import { AppError } from '../../utils/AppError.js';
import { roomManager } from '../../socket/roomManager.js';
import { Server } from 'socket.io';

// A helper to extend the default Request type
interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const createRoomHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      throw new AppError('Authentication error, user not found.', 401);
    }

    const room = await createRoom(name, ownerId);
    res.status(201).json({ status: 'success', data: room });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoomByIdHandler = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new AppError('Room ID is required in the URL.', 400);
    }

    const room = await getRoomById(roomId);
    res.status(200).json({ status: 'success', data: room });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 👇 THIS ENTIRE FUNCTION IS THE FIX
export const addVideoToQueueHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { youtubeUrl } = req.body;
    const userId = req.user?.userId;
    const io: Server = req.app.get('io'); // Get the io instance from the app

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

    // 2. Add the newly created video to our in-memory roomManager
    roomManager.addVideo(roomId, {
      id: newVideo.id,
      youtubeId: newVideo.youtubeId,
      title: newVideo.title,
      duration: newVideo.duration,
      addedBy: newVideo.addedById,
    });
    
    // 3. Check if this is the first video and start playback
    const room = roomManager.getRoomState(roomId);
    if (room && !room.currentlyPlaying && room.queue.length === 1) {
        roomManager.startNextVideo(roomId);
    }

    // 4. Get the final updated state and broadcast it to everyone in the room
    const updatedState = roomManager.getRoomState(roomId);
    io.to(roomId).emit('room_state_update', updatedState);

    // 5. Send a success response for the initial API call
    res.status(201).json({ status: 'success', data: newVideo });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
