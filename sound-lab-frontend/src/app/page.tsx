"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { createRoom } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

// Animation variants for Framer Motion with explicit typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  },
};

const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function HomePage() {
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { authStatus, token, initializeAuth, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authStatus !== 'authenticated' || !token) {
      setError('You must be logged in to create a room.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await createRoom(roomName, token);
      const newRoomId = response.data.id;
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      let errorMessage = 'Failed to create room. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      router.push(`/room/${joinRoomId.trim()}`);
    }
  };

  const renderAuthLinks = () => (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="secondary" className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full px-6 py-2">
          Log In
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 rounded-full px-6 py-2">
          Sign Up
        </Button>
      </Link>
    </div>
  );

  const renderUserActions = () => (
    <div className="flex items-center gap-3">
      <Button 
        variant="danger" 
        onClick={logout} 
        className="backdrop-blur-sm bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:scale-105 transition-all duration-300 rounded-full px-6 py-2"
      >
        Log Out
      </Button>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating music notes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-4xl"
              style={{
                left: `${20 + (i * 12)}%`,
                top: `${30 + (i * 8)}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 10, -10, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col backdrop-blur-sm">
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between p-6 backdrop-blur-md bg-white/5 border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">♫</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Sound Lab
            </h1>
          </div>
          {authStatus === 'authenticated' ? renderUserActions() : renderAuthLinks()}
        </motion.header>

        <main className="flex flex-1 items-center justify-center p-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl w-full">
            
            {/* Hero Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="block text-white">Listen</span>
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Together
                  </span>
                </h2>
                <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                  Create collaborative playlists, vote on tracks, and sync your music experience with friends in real-time.
                </p>
              </motion.div>

              {authStatus === 'unauthenticated' && (
                <motion.div variants={itemVariants}>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-2xl hover:scale-105 transition-all duration-300">
                      Start Listening
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Interactive Panel */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Background image with overlay */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <img 
                  src="/bg-img.png" 
                  alt="Music Background"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm"></div>
              </div>

              {/* Interactive Form Container */}
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                {authStatus === 'authenticated' ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">Create Your Room</h3>
                      <p className="text-white/70">Start a new listening session</p>
                    </div>

                    <form onSubmit={handleCreateRoom} className="space-y-6">
                      <div className="space-y-4">
                        <Input
                          type="text"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          placeholder="Name your music room..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl py-4 px-6 text-center backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                          required
                          disabled={isLoading}
                        />
                        <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          {isLoading ? <Spinner size="sm" /> : 'Create Room'}
                        </Button>
                      </div>
                      {error && (
                        <p className="text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          {error}
                        </p>
                      )}
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-white/70 rounded-full">
                          or join existing
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleJoinRoom} className="space-y-4">
                      <Input
                        type="text"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        placeholder="Enter Room ID..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl py-4 px-6 text-center backdrop-blur-sm focus:border-blue-400 focus:ring-blue-400/20"
                        required
                      />
                      <Button 
                        type="submit" 
                        variant="secondary" 
                        className="w-full backdrop-blur-sm bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 font-semibold py-4 rounded-2xl hover:scale-105 transition-all duration-300"
                      >
                        Join Room
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                      <span className="text-white text-3xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Jam?</h3>
                      <p className="text-white/70">Sign in to create and join music rooms</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link href="/login" className="block">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/signup" className="block">
                        <Button 
                          variant="secondary" 
                          className="w-full backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold py-4 rounded-2xl hover:scale-105 transition-all duration-300"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating decorative elements */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80"
              />
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60"
                style={{ animationDelay: '2s' }}
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}