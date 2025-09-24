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

// Animation for individual items fading and sliding in with flame-like effect
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Animation for the header with subtle flame flicker
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

// Flame flicker animation for background elements
const flameVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
  flicker: {
    opacity: [0.6, 1, 0.8, 1],
    scale: [1, 1.05, 0.98, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
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
          className="text-neutral-800 hover:text-white hover:bg-orange-500/20 rounded-full px-5 py-2 transition-all duration-300"
        >
          Log In
        </Button>
      </Link>
      <Link href="/signup">
        <Button
          variant="ghost"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 rounded-full px-5 py-2 transition-all duration-300 shadow-lg"
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
        className="backdrop-blur-sm bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40 rounded-full px-5 py-2 transition-all duration-300"
      >
        Log Out
      </Button>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/30 text-white">
      {/* Animated Flame Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          variants={flameVariants}
          initial="hidden"
          animate={["visible", "flicker"]}
          className="absolute top-[10%] left-[5%] w-72 h-72 bg-gradient-to-r from-red-500/15 to-orange-500/10 rounded-full blur-3xl"
          style={{ animationDelay: "0s" }}
        />
        <motion.div
          variants={flameVariants}
          initial="hidden"
          animate={["visible", "flicker"]}
          className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-gradient-to-r from-yellow-500/12 to-red-500/15 rounded-full blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />
        <motion.div
          variants={flameVariants}
          initial="hidden"
          animate={["visible", "flicker"]}
          className="absolute top-[20%] right-[25%] w-60 h-60 bg-gradient-to-r from-orange-500/10 to-yellow-500/8 rounded-full blur-3xl"
          style={{ animationDelay: "3s" }}
        />
        <motion.div
          variants={flameVariants}
          initial="hidden"
          animate={["visible", "flicker"]}
          className="absolute bottom-[30%] left-[20%] w-80 h-80 bg-gradient-to-r from-red-400/8 to-orange-400/12 rounded-full blur-3xl"
          style={{ animationDelay: "4.5s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between p-5 backdrop-blur-sm bg-black/20 border-b border-orange-500/20"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 0.95, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-9 h-9 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl">🐦‍🔥</span>
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Sound Lab
            </h1>
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
              <motion.h2
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 165, 0, 0.3)",
                    "0 0 30px rgba(255, 69, 0, 0.4)",
                    "0 0 20px rgba(255, 165, 0, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="text-5xl md:text-7xl font-black tracking-tight leading-tight"
              >
                <span className="block text-white">Your Music,</span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Perfectly Synced.
                </span>
              </motion.h2>
              <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
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
                  <motion.h3
                    animate={{
                      color: [
                        "rgb(255, 255, 255)",
                        "rgb(255, 213, 128)",
                        "rgb(255, 255, 255)",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="text-xl font-bold mb-4"
                  >
                    Start a New Session
                  </motion.h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Name your new room..."
                      className="bg-black/30 border-orange-500/30 text-white placeholder:text-orange-200/60 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-orange-400 focus:ring-orange-400/30 focus:shadow-orange-500/20 focus:shadow-lg transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-orange-500/30 hover:shadow-xl transition-all duration-300"
                      >
                        {isLoading ? <Spinner size="sm" /> : "Create Room"}
                      </Button>
                    </motion.div>
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 bg-red-500/10 p-2 rounded-lg backdrop-blur-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-orange-500/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-gradient-to-r from-gray-900 via-red-900/50 to-gray-900 text-orange-200/70 rounded-full border border-orange-500/20">
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
                      className="bg-black/30 border-orange-500/30 text-white placeholder:text-orange-200/60 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-orange-400 focus:ring-orange-400/30 focus:shadow-orange-500/20 focus:shadow-lg transition-all duration-300"
                      required
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full sm:w-auto backdrop-blur-sm bg-orange-500/20 border-orange-500/40 text-orange-200 hover:bg-orange-500/30 hover:border-orange-400/60 hover:text-white transition-all duration-300"
                      >
                        Join Room
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </motion.div>
            )}

            {authStatus === "unauthenticated" && (
              <motion.div variants={itemVariants} className="mt-12">
                <Link href="/login">
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 40px rgba(255, 165, 0, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-2xl transition-all duration-300">
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}