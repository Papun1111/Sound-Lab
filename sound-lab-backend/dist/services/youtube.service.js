import axios from 'axios';
import { AppError } from '../utils/AppError.js';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';
export const getVideoDetails = async (videoId) => {
    if (!YOUTUBE_API_KEY) {
        throw new AppError('YouTube API key is not configured.', 500);
    }
    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet,contentDetails',
                id: videoId,
                key: YOUTUBE_API_KEY,
            },
        });
        const item = response.data.items[0];
        if (!item) {
            throw new AppError('Video not found on YouTube.', 404);
        }
        return {
            title: item.snippet.title,
            duration: item.contentDetails.duration,
            thumbnail: item.snippet.thumbnails.default.url,
        };
    }
    catch (error) {
        console.error('YouTube API Error:', error.response?.data || error.message);
        throw new AppError('Failed to fetch video details from YouTube.', 500);
    }
};
