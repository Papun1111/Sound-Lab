"use client";

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useRoomStore } from '@/store/useRoomStore';
import { Socket } from 'socket.io-client';
import { FaStepForward } from 'react-icons/fa';
import { useParams } from 'next/navigation';

interface PlayerProps {
  socket: Socket | null;
}

export const Player: React.FC<PlayerProps> = ({ socket }) => {
  const currentlyPlaying = useRoomStore((state) => state.currentlyPlaying);
  const {roomId} =useParams();

  const handleNextVideo = () => {
    if (socket && roomId) {
      socket.emit('request_next_video', roomId);
    }
  };

  if (!currentlyPlaying) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-800 text-gray-400">
        <p>Nothing is playing. Add a video to the queue to get started!</p>
      </div>
    );
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      controls: 1,
      color: 'red',
    },
  };

  return (
    <div className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-lg shadow-2xl">
        <YouTube
          key={currentlyPlaying.video.id}
          videoId={currentlyPlaying.video.youtubeId}
          opts={opts}
          onEnd={handleNextVideo}
          className="h-full w-full"
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex-1 truncate" title={currentlyPlaying.video.title}>
          {currentlyPlaying.video.title}
        </h2>
        <button
          onClick={handleNextVideo}
          className="flex-shrink-0 rounded-full bg-indigo-600 p-3 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          title="Next Video"
        >
          <FaStepForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

