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
// Import the Galaxy component

import RippleGrid from "@/components/RippleGrid";
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

  const showcaseItems = [
    { title: "COLLABORATIVE QUEUE", image: "https://placehold.co/600x400/212121/F3EFEA?text=Queue" },
    { title: "LIVE SYNC", image: "https://placehold.co/600x400/D63426/F3EFEA?text=Sync" },
    { title: "VOTE TO SKIP", image: "https://placehold.co/600x400/212121/F3EFEA?text=Vote" },
    { title: "DISCOVER MUSIC", image: "https://placehold.co/600x400/D63426/F3EFEA?text=Discover" },
  ];
  
  // --- UI ---
  return (
    // Changed base bg to dark (#050505) and text to light (#F3EFEA) for contrast with Galaxy
    <div className="min-h-screen w-full bg-[#050505] text-[#F3EFEA] antialiased relative overflow-hidden">
      
      {/* --- GALAXY BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
          <RippleGrid
    enableRainbow={true}
    gridColor="#ffffff"
    rippleIntensity={0.05}
    gridSize={20}
    gridThickness={15}
    mouseInteraction={true}

    mouseInteractionRadius={2.5}
    opacity={0.8}
  />
      </div>

      {/* --- CONTENT WRAPPER (z-10 to sit above Galaxy) --- */}
      <div className="relative z-10">
      
        {/* --- Header Section --- */}
        {/* Added backdrop-blur and transparency to show Galaxy behind */}
        <header className="fixed top-0 z-50 w-full bg-black/30 backdrop-blur-md border-b border-white/10 text-[#F3EFEA]">
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
          {/* --- Hero Section --- */}
          <section className="flex flex-col justify-center min-h-screen text-left max-w-7xl mx-auto px-4 pt-20">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <motion.h1 variants={itemVariants} className="text-[10vw] md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-white mix-blend-overlay">
                      YOUR MUSIC,
                  </motion.h1>
                  {/* Kept the Red accent */}
                  <motion.h1 variants={itemVariants} className="text-[10vw] md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-[#D63426]">
                      IN SYNC.
                  </motion.h1>
                  <motion.p variants={itemVariants} className="mt-6 max-w-md text-lg text-neutral-300">
                      Create collaborative rooms, build shared queues, and experience music together in perfect, real-time sync.
                  </motion.p>
              </motion.div>
          </section>

          {/* --- Showcase Section --- */}
          <section className="py-12" id="features">
              <div className="flex overflow-x-auto space-x-6 pb-6 pl-4 md:pl-12 scrollbar-hide">
                  {showcaseItems.map((item, index) => (
                      <motion.div 
                          key={index} 
                          className="flex-shrink-0 w-80 md:w-96 group"
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                          <div className="overflow-hidden bg-neutral-800 border border-white/10">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"/>
                          </div>
                          <h3 className="mt-3 text-lg font-bold tracking-tight text-white">{item.title}</h3>
                      </motion.div>
                  ))}
              </div>
          </section>
          
          {/* --- Room Creation/Joining Section --- */}
          {/* Made transparent/dark to fit theme */}
          <section id="about" className="py-24 px-4 bg-black/40 backdrop-blur-sm border-t border-white/5">
              <div className="max-w-2xl mx-auto text-center">
                   <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">GET STARTED</h2>
                   <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                     Create a new listening room for your friends or jump into an existing one with a Room ID.
                   </p>
                  {authStatus === 'authenticated' ? (
                      <motion.div variants={itemVariants} className="mt-12 w-full">
                          <form onSubmit={handleCreateRoom} className="space-y-4 mb-8">
                               <div className="flex flex-col sm:flex-row items-center gap-3">
                                  <Input
                                      type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
                                      placeholder="Name your new room..."
                                      // Updated Input styles for Dark Mode
                                      className="bg-black/50 border-2 border-neutral-700 text-[#F3EFEA] placeholder:text-neutral-500 text-center text-lg h-14 rounded-none focus:border-[#D63426] transition-colors w-full"
                                      required disabled={isLoading}
                                  />
                                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-14 px-10 text-lg bg-[#D63426] text-white rounded-none hover:bg-white hover:text-black transition-colors">
                                      {isLoading ? <Spinner size="sm" /> : 'Create'}
                                  </Button>
                              </div>
                              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                          </form>
                          
                          <div className="text-center font-bold text-neutral-600 my-6">OR</div>

                          <form onSubmit={handleJoinRoom} className="space-y-4">
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                  <Input
                                      type="text" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)}
                                      placeholder="Paste an existing Room ID..."
                                      // Updated Input styles for Dark Mode
                                      className="bg-black/50 border-2 border-neutral-700 text-[#F3EFEA] placeholder:text-neutral-500 text-center text-lg h-14 rounded-none focus:border-[#D63426] transition-colors w-full"
                                      required
                                  />
                                  <Button type="submit" className="w-full sm:w-auto h-14 px-10 text-lg bg-white text-black rounded-none hover:bg-[#D63426] hover:text-white transition-colors">
                                      Join Room
                                  </Button>
                              </div>
                          </form>
                      </motion.div>
                  ) : (
                      <motion.div variants={itemVariants} className="mt-12">
                          <Link href="/login">
                              <Button className="h-16 px-12 text-xl bg-[#D63426] text-white rounded-none hover:bg-white hover:text-black transition-colors">
                                  Login to Get Started
                              </Button>
                          </Link>
                      </motion.div>
                  )}
              </div>
          </section>

          {/* --- Footer Section --- */}
          <footer className="w-full p-10 md:p-20 bg-black text-[#F3EFEA] border-t border-white/10">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                  <div>
                      <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-neutral-800">
                          GET IN SYNC.
                      </h3>
                      <p className="mt-4 text-neutral-500">Sound Lab &copy; {new Date().getFullYear()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <a href="#" className="p-3 border border-neutral-800 hover:border-[#D63426] hover:text-[#D63426] transition-all">
                          <Instagram size={24} />
                      </a>
                       <a href="#" className="p-3 border border-neutral-800 hover:border-[#D63426] hover:text-[#D63426] transition-all">
                          <Twitter size={24} />
                      </a>
                       <a href="#" className="p-3 border border-neutral-800 hover:border-[#D63426] hover:text-[#D63426] transition-all">
                          <Facebook size={24} />
                      </a>
                  </div>
              </div>
          </footer>
        </main>
      </div>
    </div>
  );
}