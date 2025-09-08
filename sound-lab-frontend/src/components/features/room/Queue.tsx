"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addVideoToRoom } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { FaThumbsUp } from 'react-icons/fa';
import { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';

interface QueueProps {
  socket: Socket | null;
}

export const Queue: React.FC<QueueProps> = ({ socket }) => {
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  
  const queue = useRoomStore((state) => state.queue);
  const { token, user } = useAuthStore();
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomId || !token) {
      setError("Cannot add video: Room ID is missing or you are not logged in.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // The API call now triggers the backend to broadcast the update
      await addVideoToRoom(roomId, youtubeUrl, token);
      setYoutubeUrl('');
    } catch (err) {
      let errorMessage = 'Failed to add video. Please check the URL.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (videoId: string) => {
    if (socket && roomId) {
      socket.emit('vote_video', { roomId, videoId });
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">Up Next</h3>
      
      <form onSubmit={handleAddVideo} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Paste YouTube URL"
          className="bg-gray-700 text-white border-gray-600"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'Add'}
        </Button>
      </form>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {queue.map((video) => {
          const hasVoted = user ? video.votes.includes(user.userId) : false;
          return (
            <div key={video.id} className="flex items-center gap-4 rounded-md bg-gray-700 p-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate" title={video.title}>{video.title}</p>
              </div>
              <button
                onClick={() => handleVote(video.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-colors ${
                  hasVoted
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <FaThumbsUp />
                <span>{video.votes.length}</span>
              </button>
            </div>
          );
        })}
        {queue.length === 0 && <p className="text-sm text-gray-400">The queue is empty.</p>}
      </div>
    </div>
  );
};
