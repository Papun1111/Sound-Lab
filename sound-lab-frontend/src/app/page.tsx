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
import { Instagram, Twitter, Facebook } from "lucide-react";


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- Main Component ---

export default function HomePage() {
  // --- STATE AND LOGIC (UNCHANGED) ---
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { authStatus, token, initializeAuth, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // --- CORE FUNCTIONALITY (UNCHANGED) ---
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

  // --- NEW: Dummy data for the showcase cards, inspired by the video ---
  const showcaseItems = [
    { title: "COLLABORATIVE QUEUE", image: "https://placehold.co/600x400/212121/F3EFEA?text=Queue" },
    { title: "LIVE SYNC", image: "https://placehold.co/600x400/D63426/F3EFEA?text=Sync" },
    { title: "VOTE TO SKIP", image: "https://placehold.co/600x400/212121/F3EFEA?text=Vote" },
    { title: "DISCOVER MUSIC", image: "https://placehold.co/600x400/D63426/F3EFEA?text=Discover" },
  ];
  
  // --- UI ---
  // The entire return statement is replaced to match the new design.
  return (
    // Set the base colors inspired by the video: off-white background and charcoal text.
    <div className="min-h-screen w-full bg-[#F3EFEA] text-[#212121] antialiased">
      {/* --- NEW: Header Section --- */}
      <header className="fixed top-0 z-50 w-full bg-[#212121] text-[#F3EFEA]">
        <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            SOUND LAB
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-[#D63426] transition-colors">FEATURES</Link>
            <Link href="#about" className="hover:text-[#D63426] transition-colors">ABOUT</Link>
            {authStatus === 'authenticated' ? (
                <button onClick={logout} className="hover:text-[#D63426] transition-colors">LOG OUT</button>
            ) : (
                <Link href="/login" className="hover:text-[#D63426] transition-colors">LOG IN</Link>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* --- NEW: Hero Section --- */}
        {/* This section mimics the huge, bold typography from the video. */}
        <section className="flex flex-col justify-center min-h-screen text-left max-w-7xl mx-auto px-4 pt-20">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.h1 variants={itemVariants} className="text-[10vw] md:text-8xl lg:text-9xl font-black leading-none tracking-tighter">
                    YOUR MUSIC,
                </motion.h1>
                <motion.h1 variants={itemVariants} className="text-[10vw] md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-[#D63426]">
                    IN SYNC.
                </motion.h1>
                <motion.p variants={itemVariants} className="mt-6 max-w-md text-lg text-neutral-600">
                    Create collaborative rooms, build shared queues, and experience music together in perfect, real-time sync.
                </motion.p>
            </motion.div>
        </section>

        {/* --- NEW: Horizontal Scroll Showcase Section --- */}
        {/* Replicates the "IN YOUR FEED" horizontally scrolling element. */}
        <section className="py-12" id="features">
            <div className="flex overflow-x-auto space-x-6 pb-6 pl-4 md:pl-12">
                {showcaseItems.map((item, index) => (
                    <motion.div 
                        key={index} 
                        className="flex-shrink-0 w-80 md:w-96 group"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="overflow-hidden bg-neutral-300">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        </div>
                        <h3 className="mt-3 text-lg font-bold tracking-tight">{item.title}</h3>
                    </motion.div>
                ))}
            </div>
        </section>
        
        {/* --- RE-STYLED: Room Creation/Joining Section --- */}
        {/* The core logic is preserved, but the forms are restyled for the new theme. */}
        <section id="about" className="py-24 px-4 bg-white">
            <div className="max-w-2xl mx-auto text-center">
                 <h2 className="text-5xl md:text-6xl font-black tracking-tighter">GET STARTED</h2>
                 <p className="mt-4 text-neutral-600 max-w-lg mx-auto">
                    Create a new listening room for your friends or jump into an existing one with a Room ID.
                 </p>
                {authStatus === 'authenticated' ? (
                    <motion.div variants={itemVariants} className="mt-12 w-full">
                        <form onSubmit={handleCreateRoom} className="space-y-4 mb-8">
                             <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Name your new room..."
                                    className="bg-transparent border-2 border-neutral-300 text-center text-lg h-14 rounded-none focus:border-[#212121] transition-colors w-full"
                                    required disabled={isLoading}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-14 px-10 text-lg bg-[#D63426] text-white rounded-none hover:bg-[#212121] transition-colors">
                                    {isLoading ? <Spinner size="sm" /> : 'Create'}
                                </Button>
                            </div>
                            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        </form>
                        
                        <div className="text-center font-bold text-neutral-400 my-6">OR</div>

                        <form onSubmit={handleJoinRoom} className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    type="text" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)}
                                    placeholder="Paste an existing Room ID..."
                                    className="bg-transparent border-2 border-neutral-300 text-center text-lg h-14 rounded-none focus:border-[#212121] transition-colors w-full"
                                    required
                                />
                                <Button type="submit" className="w-full sm:w-auto h-14 px-10 text-lg bg-[#212121] text-white rounded-none hover:bg-[#D63426] transition-colors">
                                    Join Room
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div variants={itemVariants} className="mt-12">
                        <Link href="/login">
                            <Button className="h-16 px-12 text-xl bg-[#D63426] text-white rounded-none hover:bg-[#212121] transition-colors">
                                Login to Get Started
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>

        {/* --- NEW: Footer Section --- */}
        {/* A large, bold footer inspired by the "HIT US UP" section in the video. */}
        <footer className="w-full p-10 md:p-20 bg-[#212121] text-[#F3EFEA]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        GET IN SYNC.
                    </h3>
                    <p className="mt-4 text-neutral-400">Sound Lab &copy; {new Date().getFullYear()}</p>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#" className="p-3 border border-neutral-600 hover:border-white hover:bg-white/10 transition-all">
                        <Instagram size={24} />
                    </a>
                     <a href="#" className="p-3 border border-neutral-600 hover:border-white hover:bg-white/10 transition-all">
                        <Twitter size={24} />
                    </a>
                     <a href="#" className="p-3 border border-neutral-600 hover:border-white hover:bg-white/10 transition-all">
                        <Facebook size={24} />
                    </a>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}