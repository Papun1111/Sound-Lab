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
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Animation Variants (Logic Unchanged) ---
const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.95,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

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
    // Main container with the new gradient background
    <div className="flex h-full flex-col rounded-lg bg-gradient-to-tr from-orange-200 via-transparent to-red-400 border border-rose-500/30 p-4 shadow-lg">
      {/* Header with gradient text effect */}
      <h3 className="mb-4 text-lg font-bold bg-gradient-to-r from-lime-300 to-black text-transparent bg-clip-text">
        Up Next
      </h3>

      <form onSubmit={handleAddVideo} className="mb-4 flex gap-3">
        {/* Input styled with new theme */}
        <Input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Paste YouTube URL..."
          className="bg-black/30 border-rose-500/40 text-lime-200 placeholder:text-lime-200/50 rounded-full py-2 px-4 focus:border-lime-400 focus:ring-lime-400/30"
          disabled={isLoading}
        />
        {/* Button styled with new theme */}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-lime-400 hover:bg-lime-500 focus:ring-lime-300 text-black font-bold rounded-full px-5 transition-colors"
        >
          {isLoading ? <Spinner size="sm" /> : 'Add'}
        </Button>
      </form>
      {error && <p className="text-sm text-rose-400 mb-2 text-center">{error}</p>}

      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        <AnimatePresence>
          {queue.map((video) => {
            const hasVoted = user ? video.votes.includes(user.userId) : false;
            return (
              <motion.div
                key={video.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex items-center gap-4 rounded-lg bg-black/20 hover:bg-rose-900/20 transition-colors p-2"
              >
                <div className="flex-1 min-w-0">
                  {/* Video title with new theme color */}
                  <p className="text-sm font-medium text-lime-200/90 truncate" title={video.title}>
                    {video.title}
                  </p>
                </div>
                {/* Vote button with new theme colors */}
                <button
                  onClick={() => handleVote(video.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-colors ${
                    hasVoted
                      ? 'bg-lime-400 text-black'
                      : 'bg-rose-500/10 text-lime-200/70 hover:bg-rose-500/20'
                  }`}
                >
                  <FaThumbsUp />
                  <span>{video.votes.length}</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {queue.length === 0 && (
          // Empty queue message with new theme color
          <div className="text-sm text-lime-200/50 text-center pt-8">
            The queue is empty.
          </div>
        )}
      </div>
    </div>
  );
};