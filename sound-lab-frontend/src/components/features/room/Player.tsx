"use client";

import React, { useRef, useEffect } from 'react';
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

  const playerRef = useRef<YouTubePlayer | null>(null);
  const isServerUpdate = useRef(false);

  // This is the single source of truth for commanding the player based on state changes.
  const syncPlayerState = async () => {
    const player = playerRef.current;
    const serverState = useRoomStore.getState().currentlyPlaying; // Always get the latest state

    if (!player || !serverState || !serverState.video) {
      return;
    }

    // Flag that the following actions are from the server to prevent feedback loops
    isServerUpdate.current = true;

    try {
      const [playerState, playerCurrentTime] = await Promise.all([
        player.getPlayerState(),
        player.getCurrentTime(),
      ]);

      // Sync play/pause state
      if (serverState.isPlaying && playerState !== 1) { // 1 = playing
        player.playVideo();
      } else if (!serverState.isPlaying && playerState === 1) {
        player.pauseVideo();
      }

      // Sync seek time if there's a significant difference
      if (Math.abs(playerCurrentTime - serverState.seekTime) > 2) {
        player.seekTo(serverState.seekTime, true);
      }
    } catch (error) {
        console.error("Error syncing player state:", error);
    }

    // Allow user actions again after a short delay
    setTimeout(() => { isServerUpdate.current = false; }, 500);
  };

  // Run the sync logic whenever the server state changes
  useEffect(() => {
    syncPlayerState();
  }, [currentlyPlaying]);

  const handleNextVideo = () => {
    if (socket && roomId) {
      socket.emit('request_next_video', roomId);
    }
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

  // ✨ FIX: The onReady handler's only job is to store the player reference
  // and then immediately trigger a sync. This is the most reliable way to handle the initial load.
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    syncPlayerState(); // Sync immediately once the player is ready
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
    },
  };

  return (
    <animated.div style={playerAnimation} className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-lg shadow-2xl">
        <YouTube
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

