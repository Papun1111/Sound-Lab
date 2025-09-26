"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addVideoToRoom } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ThumbsUp } from 'lucide-react'; 
import { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import { motion, AnimatePresence, Variants } from 'motion/react';


const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

interface QueueProps {
  socket: Socket | null;
}

export const Queue: React.FC<QueueProps> = ({ socket }) => {
  // --- All original state and logic are preserved ---
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
    // Main container restyled with a clean, white background and a simple border.
    <div className="flex h-full flex-col bg-white border border-neutral-200 p-4">
      {/* Header restyled to be bold and clean. */}
      <h3 className="mb-4 text-xl font-bold text-[#212121]">
        Up Next
      </h3>

      {/* Form elements now match the application-wide style. */}
      <form onSubmit={handleAddVideo} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Paste YouTube URL..."
          className="h-11 bg-transparent border-2 border-neutral-300 text-gray-900 rounded-none focus:border-[#212121] transition-colors w-full"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-24 bg-[#212121] hover:bg-[#D63426] text-white rounded-none transition-colors"
        >
          {isLoading ? <Spinner size="sm" /> : 'Add'}
        </Button>
      </form>
      {error && <p className="text-sm text-red-600 mb-2 text-center">{error}</p>}

      {/* The scrollable list area. */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-2 -mr-2">
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
                className="flex items-center gap-4 rounded p-2 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  {/* Video title with updated text color. */}
                  <p className="text-sm font-medium text-neutral-800 truncate" title={video.title}>
                    {video.title}
                  </p>
                </div>
                {/* Vote button restyled with the new color palette. */}
                <button
                  onClick={() => handleVote(video.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    hasVoted
                      ? 'bg-[#D63426] text-white'
                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                  }`}
                >
                  <ThumbsUp size={12} />
                  <span>{video.votes.length}</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {queue.length === 0 && (
          // Empty queue message restyled for consistency.
          <div className="text-sm text-neutral-500 text-center pt-8">
            The queue is empty. Add a video to get started.
          </div>
        )}
      </div>
    </div>
  );
};