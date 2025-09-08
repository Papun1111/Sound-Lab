import prisma from '../../services/prisma.service.js';
import { getVideoDetails } from '../../services/youtube.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Creates a new room.
 * @param {string} name - The name of the room.
 * @param {string} ownerId - The ID of the user creating the room.
 */
export const createRoom = async (name: string, ownerId: string) => {
  if (!name) {
    throw new AppError('Room name is required', 400);
  }
  const room = await prisma.room.create({
    data: {
      name,
      ownerId,
    },
  });
  return room;
};

/**
 * Fetches a room and its video queue by its ID.
 * @param {string} roomId - The ID of the room to fetch.
 */
export const getRoomById = async (roomId: string) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: {
        select: { id: true, username: true }, // Only include public owner info
      },
      queue: {
        orderBy: { createdAt: 'asc' }, // Order videos by when they were added
      },
    },
  });

  if (!room) {
    throw new AppError('Room not found', 404);
  }
  return room;
};

/**
 * Adds a video to a room's queue.
 * @param {string} roomId - The ID of the room.
 * @param {string} youtubeUrl - The full YouTube URL of the video.
 * @param {string} userId - The ID of the user adding the video.
 */
export const addVideoToQueue = async (roomId: string, youtubeUrl: string, userId: string) => {
  // Regex to extract the 11-character video ID from various YouTube URL formats
  const videoIdRegex = /(?:v=|youtu\.be\/|embed\/)(.{11})/;
  const match = youtubeUrl.match(videoIdRegex);
  const videoId = match ? match[1] : null;

  if (!videoId) {
    throw new AppError('Invalid YouTube URL format.', 400);
  }

  // Fetch video details from the YouTube API
  const details = await getVideoDetails(videoId);

  // Add the video to the database
  const newVideo = await prisma.queuedVideo.create({
    data: {
      youtubeId: videoId,
      title: details.title,
      duration: 0, // You would parse details.duration to get seconds
      thumbnail: details.thumbnail,
      roomId: roomId,
      addedById: userId,
    },
  });

  return newVideo;
};