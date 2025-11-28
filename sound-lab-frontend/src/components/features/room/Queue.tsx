/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addVideoToRoom } from '@/services/api';
// ✨ Import the new search function
import { searchYoutubeVideos } from '@/services/api'; 
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ThumbsUp, Plus, Search, X } from 'lucide-react';
import { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { apiClient } from '@/lib/axios';

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

interface RecommendedVideo {
  id: string;
  title: string;
  thumbnail: string;
}

interface QueueProps {
  socket: Socket | null;
}

export const Queue: React.FC<QueueProps> = ({ socket }) => {
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  
  const queue = useRoomStore((state) => state.queue);
  const { token, user } = useAuthStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Recommendations & Search State ---
  const [recommendations, setRecommendations] = useState<RecommendedVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false); // To track if we are showing search results vs trending
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [addingRecId, setAddingRecId] = useState<string | null>(null);

  // Helper to determine if input is a URL
  const isUrl = (text: string) => text.trim().startsWith('http');

  // Initial fetch for trending
  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoadingRecs(true);
    try {
      const { data } = await apiClient.get('/youtube/trending');
      setRecommendations(data.slice(0, 4));
      setIsSearching(false);
    } catch (error) {
      console.error("Failed to fetch trending music:", error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Unified handler for the main form (Add URL or Search)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomId || !token) {
      setError("You must be logged in to modify the queue.");
      return;
    }
    setError(null);

    const value = inputValue.trim();
    if (!value) return;

    if (isUrl(value)) {
      // --- CASE 1: User pasted a URL -> Direct Add ---
      setIsLoading(true);
      try {
        await addVideoToRoom(roomId, value, token);
        setInputValue('');
      } catch (err) {
        let errorMessage = 'Failed to add video.';
        if (err instanceof AxiosError && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- CASE 2: User typed keywords -> Perform Search ---
      setIsLoadingRecs(true);
      setIsSearching(true); // Switch mode to search results
      try {
        const results = await searchYoutubeVideos(value);
        setRecommendations(results);
      } catch (err) {
        setError("Search failed.");
        setTimeout(() => setError(null), 2000);
      } finally {
        setIsLoadingRecs(false);
      }
    }
  };

  const clearSearch = () => {
    setInputValue('');
    loadTrending(); // Go back to trending
  };

  const handleAddRecommendation = async (video: RecommendedVideo) => {
    if (!roomId || !token) return;
    setAddingRecId(video.id);
    try {
      const fullUrl = `https://www.youtube.com/watch?v=${video.id}`;
      await addVideoToRoom(roomId, fullUrl, token);
    } catch(e) {
      setError("Failed to add video");
      setTimeout(() => setError(null), 2000);
    } finally {
      setAddingRecId(null);
    }
  };

  const handleVote = (videoId: string) => {
    if (socket && roomId) {
      socket.emit('vote_video', { roomId, videoId });
    }
  };

  return (
    <div className="flex h-full flex-col bg-white border border-neutral-200 p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#212121]">
          Up Next
        </h3>
      </div>

      {/* Unified Input Form */}
      <form onSubmit={handleSubmit} className="mb-2 flex gap-2 relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search songs or paste URL..."
          className="h-11 bg-transparent border-2 border-neutral-300 text-gray-900 rounded-none focus:border-[#212121] transition-colors w-full pr-8"
          disabled={isLoading}
        />
        
        {/* Clear Search Button (only shows when searching/typing) */}
        {(inputValue || isSearching) && (
            <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-[105px] top-3 text-neutral-400 hover:text-red-500 transition-colors"
            >
                <X size={18} />
            </button>
        )}

        <Button 
          type="submit" 
          disabled={isLoading}
          className={`h-11 w-24 text-white rounded-none transition-colors flex items-center justify-center gap-2 ${
            isUrl(inputValue) 
                ? 'bg-[#212121] hover:bg-[#D63426]' // Dark/Red for Add
                : 'bg-[#D63426] hover:bg-[#212121]' // Red/Dark for Search
          }`}
        >
          {isLoading ? <Spinner size="sm" /> : (
            isUrl(inputValue) ? <span>Add</span> : <Search size={18} />
          )}
        </Button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

      {/* --- Recommendations / Search Results Area --- */}
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex justify-between items-center">
            {isSearching ? `Search Results` : `Trending Now`}
        </h4>
        
        {isLoadingRecs ? (
           <div className="flex justify-center py-4"><Spinner size="sm" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recommendations.length > 0 ? recommendations.map(rec => (
              <div key={rec.id} className="group relative flex items-center gap-2 p-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-200">
                 <div className="relative w-12 h-9 bg-neutral-200 flex-shrink-0 overflow-hidden rounded-sm shadow-sm">
                    <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate" title={rec.title}>
                      {rec.title}
                    </p>
                 </div>
                 <button 
                    onClick={() => handleAddRecommendation(rec)}
                    disabled={addingRecId === rec.id}
                    className="opacity-0 group-hover:opacity-100 bg-[#212121] text-white p-1.5 rounded-full hover:bg-[#D63426] transition-all shadow-sm absolute right-2"
                    title="Add to Queue"
                 >
                    {addingRecId === rec.id ? <Spinner size="sm" /> : <Plus size={12} />}
                 </button>
              </div>
            )) : (
                <div className="col-span-2 text-center text-sm text-neutral-400 py-2">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Queue List (Preserved) */}
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
                  <p className="text-sm font-medium text-neutral-800 truncate" title={video.title}>{video.title}</p>
                </div>
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
            <div className="text-sm text-neutral-500 text-center pt-8">The queue is empty. Add a video to get started.</div>
        )}
      </div>
    </div>
  );
};