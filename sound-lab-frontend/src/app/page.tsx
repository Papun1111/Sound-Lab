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
import { motion, Variants } from 'framer-motion'; // ✨ FIX: Import the Variants type

// Animation variants for Framer Motion with explicit typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the animation of child elements
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const headerVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
    <div className="flex items-center gap-4">
      <Link href="/login">
        <Button variant="secondary" className="transition-transform hover:scale-105">Log In</Button>
      </Link>
      <Link href="/signup">
        <Button variant="ghost" className="transition-transform hover:scale-105">Sign Up</Button>
      </Link>
    </div>
  );

  const renderUserActions = () => (
    <div className="flex items-center gap-4">
      <Button variant="danger" onClick={logout} className="transition-transform hover:scale-105">
        Log Out
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white bg-cover bg-center bg-no-repeat bg-pan-animated "
     style={{ backgroundImage: "url('/bg-img.png')" }}>
      <div className="flex min-h-screen flex-col bg-black/75 backdrop-blur-sm">
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between p-4 border-b border-purple-800 shadow-md"
        >
          <h1 className="text-2xl font-bold text-purple-400">Sound Lab</h1>
          {authStatus === 'authenticated' ? renderUserActions() : renderAuthLinks()}
        </motion.header>

        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <motion.h2 variants={itemVariants} className="text-5xl font-extrabold tracking-tight">Watch Together,</motion.h2>
            <motion.h2 variants={itemVariants} className="text-5xl font-extrabold tracking-tight text-purple-400">Decide Together.</motion.h2>
            <motion.p variants={itemVariants} className="mt-4 max-w-xl mx-auto text-lg text-gray-400">
              Create a room, invite your friends, and vote on what to watch next. Your synchronized YouTube experience starts here.
            </motion.p>
          </motion.div>

          {authStatus === 'authenticated' && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-10 mx-auto w-full max-w-md">
              <form
                onSubmit={handleCreateRoom}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter a name for your new room"
                    className="bg-gray-800 border-gray-600 text-center focus:border-purple-500 focus:ring-purple-500 w-full flex-grow"
                    required
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="transition-transform hover:scale-105 w-full sm:w-auto flex-shrink-0">
                    {isLoading ? <Spinner size="sm" /> : 'Create Room'}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </form>
              
              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <form
                onSubmit={handleJoinRoom}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Paste an existing Room ID"
                    className="bg-gray-800 border-gray-600 text-center focus:border-purple-500 focus:ring-purple-500 w-full flex-grow"
                    required
                  />
                  <Button type="submit" variant="secondary" className="transition-transform hover:scale-105 w-full sm:w-auto flex-shrink-0">
                    Join Room
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {authStatus === 'unauthenticated' && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-10">
              <Link href="/login">
                <Button variant="primary" className="transition-transform hover:scale-105">Get Started</Button>
              </Link>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

