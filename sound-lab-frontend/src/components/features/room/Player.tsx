"use client";

import React, { useRef, useEffect, useState } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { useRoomStore } from '@/store/useRoomStore';
import { Socket } from 'socket.io-client';
import { SkipForward } from 'lucide-react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Using framer-motion, no react-spring

interface PlayerProps {
  socket: Socket | null;
}

// --- Framer Motion Variants ---
// Defines the animation for the player when a new video loads.
const playerVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

export const Player: React.FC<PlayerProps> = ({ socket }) => {
  // --- All core player logic remains unchanged ---
  const currentlyPlaying = useRoomStore((state) => state.currentlyPlaying);
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

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

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, color: 'white', controls: 1,
      enablejsapi:1, origin: origin,
    },
  };

  return (
    <div className="w-full">
        {/* AnimatePresence handles the transition between the empty state and the player */}
        <AnimatePresence mode="wait">
            {!currentlyPlaying || !currentlyPlaying.video ? (
                <motion.div
                    key="empty-player"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex aspect-video w-full items-center justify-center rounded-lg bg-neutral-100 border-2 border-dashed border-neutral-300 text-neutral-500"
                >
                    <p>Nothing is playing. Add a video to get started!</p>
                </motion.div>
            ) : (
                <motion.div
                    key={currentlyPlaying.video.id} // This key change triggers the animation
                    variants={playerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                            >
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                        <YouTube
                            id={playerInstanceId}
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
                        <h2 className="text-xl font-bold text-[#212121] flex-1 truncate" title={currentlyPlaying.video.title}>
                            {currentlyPlaying.video.title}
                        </h2>
                        <button
                            onClick={handleNextVideo}
                            className="flex-shrink-0 rounded-full bg-[#212121] p-3 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                            title="Next Video"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};