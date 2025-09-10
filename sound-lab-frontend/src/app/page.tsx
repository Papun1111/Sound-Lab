"use client";

import React from 'react';
import ReactPlayer from 'react-player';
import { useRoomStore } from '@/store/useRoomStore';
import { Socket } from 'socket.io-client';
import { FaStepForward } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import { useSpring, animated } from '@react-spring/web';

interface PlayerProps {
  socket: Socket | null;
}

export const Player: React.FC<PlayerProps> = ({ socket }) => {
  const currentlyPlaying = useRoomStore((state) => state.currentlyPlaying);
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  const handleNextVideo = () => {
    if (socket && roomId) {
      socket.emit('request_next_video', roomId);
    }
  };

  const playerAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    key: currentlyPlaying?.video.id,
    config: { tension: 280, friction: 30 },
  });

  if (!currentlyPlaying) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-900 border-2 border-dashed border-purple-800 text-purple-400">
        <p>Nothing is playing. Add a video to the queue to get started!</p>
      </div>
    );
  }

  const videoUrl = `https://www.youtube.com/watch?v=${currentlyPlaying.video.youtubeId}`;

  return (
    <animated.div style={playerAnimation} className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-lg shadow-2xl">
        <ReactPlayer
          key={currentlyPlaying.video.id}
          src={videoUrl}
          playing={currentlyPlaying.isPlaying}
          controls={true}
          muted={true}
          width="100%"
          height="100%"
          onEnded={handleNextVideo}
          config={{
            youtube: {
                color: 'red',
                enablejsapi: 1,
            },
          }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex-1 truncate" title={currentlyPlaying.video.title}>
          {currentlyPlaying.video.title}
        </h2>
        <button
          onClick={handleNextVideo}
          className="flex-shrink-0 rounded-full bg-purple-600 p-3 text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          title="Next Video"
        >
          <FaStepForward className="h-5 w-5" />
        </button>
      </div>
    </animated.div>
  );
};

