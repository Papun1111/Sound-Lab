"use client";

import React, { useRef, useEffect, useState } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
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

  // ✨ FIX 1: Create a guaranteed unique ID for this specific player instance.
  // This helps YouTube distinguish between players, even for users in the same room.
  const [playerInstanceId] = useState(() => Math.random().toString(36).substring(7));
  const [origin, setOrigin] = useState('');

  const playerRef = useRef<YouTubePlayer | null>(null);
  const isServerUpdate = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const syncPlayer = async () => {
      const player = playerRef.current;
      if (!player || !currentlyPlaying || !currentlyPlaying.video) return;

      isServerUpdate.current = true;
      try {
        const [playerState, playerCurrentTime] = await Promise.all([
          player.getPlayerState(),
          player.getCurrentTime(),
        ]);
        
        const serverState = currentlyPlaying;
        if (playerState > 0 && Math.abs(playerCurrentTime - serverState.seekTime) > 1.5) {
          player.seekTo(serverState.seekTime, true);
        }

        if (serverState.isPlaying && playerState !== 1) {
          player.playVideo();
        } else if (!serverState.isPlaying && playerState === 1) {
          player.pauseVideo();
        }
      } catch (error) {
          console.error("Error syncing player state:", error);
      }
      setTimeout(() => { isServerUpdate.current = false; }, 500);
    };
    syncPlayer();
  }, [currentlyPlaying]);

  const handleNextVideo = () => {
    if (socket && roomId) socket.emit('request_next_video', roomId);
  };

  const handlePlay = () => {
    if (isServerUpdate.current) return;
    socket?.emit('playback_change', roomId, { isPlaying: true });
  };

  const handlePause = async () => {
    if (isServerUpdate.current) return;
    const player = playerRef.current;
    if (player) {
      const currentTime = await player.getCurrentTime();
      socket?.emit('playback_change', roomId, { isPlaying: false, seekTime: currentTime });
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    const latestState = useRoomStore.getState();
    if (latestState.currentlyPlaying?.isPlaying) {
      event.target.playVideo();
    }
  };
  
  const playerAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    key: currentlyPlaying?.video?.id,
    config: { tension: 280, friction: 30 },
  });

  if (!currentlyPlaying || !currentlyPlaying.video) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-900 border-2 border-dashed border-purple-800 text-purple-400">
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
      color: 'red',
      controls: 1,
      enablejsapi: 1,
      // ✨ FIX 2: The `origin` parameter is critical for security, as confirmed by the documentation.
      origin: origin,
    },
  };

  return (
    <animated.div style={playerAnimation} className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-lg shadow-2xl">
        <YouTube
          // ✨ FIX 3: Pass the unique ID to the player.
          id={playerInstanceId}
          key={currentlyPlaying.video.id}
          videoId={currentlyPlaying.video.youtubeId}
          opts={opts}
          onReady={onPlayerReady}
          onPlay={handlePlay}
          onPause={handlePause}
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
          className="flex-shrink-0 rounded-full bg-purple-600 p-3 text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          title="Next Video"
        >
          <FaStepForward className="h-5 w-5" />
        </button>
      </div>
    </animated.div>
  );
};

