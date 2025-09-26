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
import { ChevronDown, Music, Users, Vote } from "lucide-react"; // Icons for features

// --- Animation Variants for Framer Motion ---

// Parent container for staggering children animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// General-purpose item animation (fade in and slide up)
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

// For the animated headline text
const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.3,
            staggerChildren: 0.04,
        },
    },
};

const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
    },
};


// --- Main Component ---

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

  // --- UI Sub-components ---

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
  
  const headlineLine1 = "Your Music,";
  const headlineLine2 = "Perfectly Synced.";

  const features = [
    {
      icon: <Music className="h-8 w-8 text-orange-400" />,
      title: "Real-time Sync",
      description: "Everyone in the room hears the same part of the song at the exact same time. No more manual syncing.",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-400" />,
      title: "Collaborative Queue",
      description: "Add songs to a shared playlist. See what's coming up next and discover new music from friends.",
    },
    {
      icon: <Vote className="h-8 w-8 text-orange-400" />,
      title: "Democratic Voting",
      description: "Don't like a song in the queue? Vote to skip it. The group decides what plays next.",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-black via-red-600 to-grey-800 text-white">
      {/* Original animated background shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[10%] left-[5%] w-72 h-72 bg-gradient-to-r from-red-500/15 to-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-gradient-to-r from-yellow-500/12 to-red-500/15 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between p-5 backdrop-blur-sm bg-black/20 border-b border-orange-500/20 fixed top-0 w-full"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="w-9 h-9 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl">🐦‍🔥</span>
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Sound Lab
            </h1>
          </div>
          {authStatus === "authenticated" ? renderUserActions() : renderAuthLinks()}
        </motion.header>

        <main className="flex-grow">
          {/* --- Hero Section --- */}
          <section className="flex flex-col items-center justify-center text-center min-h-screen px-4 pt-20">
             <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center w-full max-w-4xl"
            >
                <motion.h2
                    className="text-5xl md:text-7xl font-black tracking-tight leading-tight"
                >
                    <motion.span variants={sentenceVariants} initial="hidden" animate="visible" className="block text-white">
                        {headlineLine1.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariants}>{char}</motion.span>
                        ))}
                    </motion.span>
                    <motion.span variants={sentenceVariants} initial="hidden" animate="visible" className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                         {headlineLine2.split("").map((char, index) => (
                            <motion.span key={index} variants={letterVariants}>{char}</motion.span>
                        ))}
                    </motion.span>
                </motion.h2>

                <motion.p 
                    variants={itemVariants}
                    className="mt-6 text-lg bg-gradient-to-r from-white via-lime-500 to-sky-600 bg-clip-text text-transparent max-w-xl mx-auto"
                >
                   Create collaborative playlists, vote on tracks, and sync your music experience with friends in real-time.
                </motion.p>
                
                {/* --- Forms / CTA from original code --- */}
                 {authStatus === 'authenticated' ? (
                     <motion.div variants={itemVariants} className="mt-12 w-full max-w-lg">
                        <form onSubmit={handleCreateRoom} className="space-y-4 mb-8">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Name your new room..."
                                    className="bg-black/30 border-orange-500/30 text-white placeholder:text-orange-200/60 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-orange-400 focus:ring-orange-400/30 transition-all duration-300 w-full"
                                    required
                                    disabled={isLoading}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300">
                                    {isLoading ? <Spinner size="sm" /> : 'Create Room'}
                                </Button>
                            </div>
                             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </form>
                        <div className="relative my-6">
                           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-orange-500/30"></div></div>
                           <div className="relative flex justify-center text-sm"><span className="px-3 bg-gradient-to-r from-gray-900 via-red-900/50 to-gray-900 text-orange-200/70 rounded-full border border-orange-500/20">OR</span></div>
                        </div>
                        <form onSubmit={handleJoinRoom} className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    type="text"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value)}
                                    placeholder="Paste an existing Room ID..."
                                    className="bg-black/30 border-orange-500/30 text-white placeholder:text-orange-200/60 rounded-full py-3 px-6 text-center backdrop-blur-sm focus:border-orange-400 focus:ring-orange-400/30 transition-all duration-300 w-full"
                                    required
                                />
                                <Button type="submit" variant="secondary" className="w-full sm:w-auto backdrop-blur-sm bg-orange-500/20 border-orange-500/40 text-orange-200 hover:bg-orange-500/30 hover:text-white transition-all duration-300">
                                    Join Room
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                 ) : (
                    <motion.div variants={itemVariants} className="mt-12">
                        <Link href="/login">
                            <Button className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-2xl transition-all duration-300 transform hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                    </motion.div>
                 )}
            </motion.div>
            <motion.div
              className="absolute bottom-10"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <ChevronDown className="h-8 w-8 text-white/50" />
            </motion.div>
          </section>

           {/* --- Features Section --- */}
          <section className="py-24 px-4 bg-black/20 backdrop-blur-md">
             <div className="max-w-5xl mx-auto">
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold text-center mb-16"
                >
                  We&apos;re good. <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Here&apos;s why.</span>
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          className="p-8 bg-black/20 rounded-xl border border-orange-500/20 flex flex-col items-start backdrop-blur-sm"
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="p-3 mb-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold mb-2 text-white">{feature.title}</h4>
                            <p className="text-orange-100/70">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
             </div>
          </section>
        </main>

        {/* --- Footer --- */}
        <footer className="w-full p-6 text-center text-white/60 bg-black/20 border-t border-orange-500/10">
          <p>&copy; {new Date().getFullYear()} Sound Lab. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}