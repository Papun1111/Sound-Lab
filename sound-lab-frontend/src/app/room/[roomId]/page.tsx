"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Animation and Icons (Updated to framer-motion and lucide-react)
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";

// Hooks and State Management (Unchanged)
import { useRoomSocket } from "@/app/hooks/useRoomSocket";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";

// Feature Components (Already styled)
import { Player } from "@/components/features/room/Player";
import { Queue } from "@/components/features/room/Queue";
import { UserList } from "@/components/features/room/UserList";
import { Spinner } from "@/components/ui/Spinner";

export default function RoomPage() {
  // --- All original hooks and state logic are preserved ---
  const params = useParams();
  const router = useRouter();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  const { authStatus, initializeAuth } = useAuthStore();
  const isConnected = useRoomStore((state) => state.isConnected);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  const socket = useRoomSocket(roomId);

  // --- Loading States (Restyled for consistency) ---
  if (authStatus === "loading" || !roomId || !isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3EFEA] text-[#212121]">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">
          {isConnected ? "Loading..." : "Connecting to room..."}
        </p>
      </div>
    );
  }

  return (
    // Main container with the new background color and padding.
    <main className="min-h-screen bg-[#F3EFEA] p-4 lg:p-6">
      <AnimatePresence>
        {authStatus === "authenticated" && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Header restyled with the new design language. */}
            <header className="mx-auto max-w-screen-xl mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-black text-[#212121] tracking-tighter">
               <Link href={"/"}>
                  SOUND LAB
               </Link>
             
              </h1>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-[#212121] text-white transition-colors hover:bg-neutral-700"
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
            </header>

            {/* Main layout grid (logic unchanged). */}
            <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Player socket={socket} />
              </div>

              {/* Sidebar container for Queue and UserList. */}
              <div className="flex h-[88vh] flex-col gap-6">
                <div className="flex-grow">
                  <Queue socket={socket} />
                </div>
                <div className="h-[25vh] min-h-[180px]">
                  <UserList />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}