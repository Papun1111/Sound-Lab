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
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Import for animation

// --- Animation Variants for Framer Motion ---
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
    <div className="flex h-full flex-col rounded-lg bg-gray-900/50 border border-white/10 p-4 shadow-lg backdrop-blur-xl">
      <h3 className="mb-4 text-lg font-bold text-cyan-300">Up Next</h3>
      
      <form onSubmit={handleAddVideo} className="mb-4 flex gap-3">
        <Input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Paste YouTube URL..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-full py-2 px-4 backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/30"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400 text-gray-900 font-bold rounded-full px-5"
        >
          {isLoading ? <Spinner size="sm" /> : 'Add'}
        </Button>
      </form>
      {error && <p className="text-sm text-red-400 mb-2 text-center">{error}</p>}

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
                className="flex items-center gap-4 rounded-lg bg-white/5 p-2 backdrop-blur-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate" title={video.title}>{video.title}</p>
                </div>
                <button
                  onClick={() => handleVote(video.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-colors ${
                    hasVoted
                      ? 'bg-cyan-400 text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
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
            <div className="text-sm text-white/50 text-center pt-8">The queue is empty.</div>
        )}
      </div>
    </div>
  );
};

