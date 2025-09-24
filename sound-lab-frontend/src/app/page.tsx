"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createRoom } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { AxiosError } from "axios";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Animation Variants for Framer Motion ---

// Parent container to orchestrate staggered animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation for individual items fading and sliding in
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Animation for the header
const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function HomePage() {
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { authStatus, token, initializeAuth, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // --- Core Functionality (Unchanged) ---
  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authStatus !== "authenticated" || !token) {
      setError("You must be logged in to create a room.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await createRoom(roomName, token);
      const newRoomId = response.data.id;
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      let errorMessage = "Failed to create room. Please try again.";
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

  // --- UI Components ---
  const renderAuthLinks = () => (
    <motion.div variants={itemVariants} className="flex items-center gap-3">
      <Link href="/login">
        <Button
          variant="ghost"
          className="text-neutral-800 hover:text-white hover:bg-white/10 rounded-full px-5 py-2"
        >
          Log In
        </Button>
      </Link>
      <Link href="/signup">
        <Button
          variant="ghost"
          className="bg-white text-black hover:bg-gray-200 rounded-full px-5 py-2"
        >
          Sign Up
        </Button>
      </Link>
    </motion.div>
  );

  const renderUserActions = () => (
    <motion.div variants={itemVariants} className="flex items-center gap-3">
      <Button
        variant="danger"
        onClick={logout}
        className="backdrop-blur-sm bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 rounded-full px-5 py-2"
      >
        Log Out
      </Button>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
   
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s", animationDuration: "20s" }}
        ></div>
        <div
          className="absolute top-[20%] right-[25%] w-60 h-60 bg-white/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "6s", animationDuration: "18s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between p-5 backdrop-blur-sm bg-black/10 border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="bg-amber-300 font-bold rounded-2xl text-4xl">🐦‍🔥</span>
            </div>
            <h1 className="text-xl font-bold text-white">Sound Lab</h1>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {authStatus === "authenticated"
              ? renderUserActions()
              : renderAuthLinks()}
          </motion.div>
        </motion.header>

        <main className="flex flex-1 items-center justify-center p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center w-full max-w-4xl"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                <span className="block text-white">Your Music,</span>
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Perfectly Synced.
                </span>
              </h2>
              <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
                Create collaborative playlists, vote on tracks, and sync your
                music experience with friends in real-time.
              </p>
            </motion.div>

            {authStatus === "authenticated" && (
              <motion.div
                variants={itemVariants}
                className="mt-12 w-full max-w-lg"
              >
                {/* Create Room Form */}
                <form onSubmit={handleCreateRoom} className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Start a New Session
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Name your new room..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/30"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
                    >
                      {isLoading ? <Spinner size="sm" /> : "Create Room"}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-gray-900 text-white/50 rounded-full">
                      OR
                    </span>
                  </div>
                </div>

                {/* Join Room Form */}
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Paste an existing Room ID..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/30"
                      required
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Join Room
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {authStatus === "unauthenticated" && (
              <motion.div variants={itemVariants} className="mt-12">
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-2xl">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
