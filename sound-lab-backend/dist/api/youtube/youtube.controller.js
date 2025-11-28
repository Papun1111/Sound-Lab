import axios from 'axios';
import prisma from '../../services/prisma.service.js';
import { AppError } from '../../utils/AppError.js';
export const getTrendingVideosHandler = async (req, res) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;
        if (!API_KEY)
            throw new Error("YouTube API Key missing");
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,statistics',
                chart: 'mostPopular',
                regionCode: 'IN', // India specific
                videoCategoryId: '10', // Music category
                maxResults: 10,
                key: API_KEY,
            },
        });
        const videos = response.data.items.map((item) => ({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
        }));
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching trending:', error);
        res.status(500).json({ message: 'Failed to fetch trending videos' });
    }
};
export const getUserRecommendationsHandler = async (req, res) => {
    try {
        // ✨ FIX: Access userId from req.user (standard JWT) instead of req.auth (Clerk)
        const userId = req.user?.userId;
        if (!userId)
            throw new AppError('User not found', 404);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { googleAccessToken: true },
        });
        if (!user?.googleAccessToken) {
            return res.status(200).json([]);
        }
        // 1. Get User's Playlists
        const playlistsResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
            params: {
                part: 'snippet,contentDetails',
                mine: 'true',
                maxResults: 3,
            },
            headers: {
                Authorization: `Bearer ${user.googleAccessToken}`,
            },
        });
        if (!playlistsResponse.data.items.length) {
            return res.status(200).json([]);
        }
        const firstPlaylistId = playlistsResponse.data.items[0].id;
        const playlistName = playlistsResponse.data.items[0].snippet.title;
        // 2. Get Items from the first playlist
        const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
                part: 'snippet',
                playlistId: firstPlaylistId,
                maxResults: 10,
            },
            headers: {
                Authorization: `Bearer ${user.googleAccessToken}`,
            },
        });
        const recommendations = videosResponse.data.items
            .filter((item) => item.snippet.resourceId.kind === 'youtube#video')
            .map((item) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            playlistName: playlistName,
        }));
        res.status(200).json(recommendations);
    }
    catch (error) {
        // If the token is invalid (e.g. expired), we just return empty recommendations for now
        console.error('Error fetching recommendations:', error.response?.data || error.message);
        res.status(200).json([]);
    }
};
// ✨ NEW: Search Handler
export const searchVideosHandler = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }
        const API_KEY = process.env.YOUTUBE_API_KEY;
        if (!API_KEY)
            throw new Error("YouTube API Key missing");
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: q,
                type: 'video',
                videoCategoryId: '10', // Music category
                maxResults: 10,
                key: API_KEY,
                regionCode: 'IN', // Prioritize Indian results
            },
        });
        const videos = response.data.items.map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
        }));
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({ message: 'Failed to search videos' });
    }
};
