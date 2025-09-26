"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/useRoomStore';
import { UserCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Replaced react-spring with framer-motion

// --- Type Definition (Unchanged) ---
interface User {
  userId: string;
  username: string;
}

// --- Framer Motion Variants ---
// This replaces the useTransition hook from react-spring.
const userItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const UserList = () => {
  // --- State and Logic (Unchanged) ---
  const users = useRoomStore((state) => state.users);
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    // Main container with consistent styling.
    <div className="h-full rounded-lg bg-white border border-neutral-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#212121]">In Room ({users.length})</h3>
        
        {/* "Copy ID" button animated with framer-motion. */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={handleCopy}
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-[#212121] text-white hover:bg-neutral-700'
          }`}
          title="Copy Room ID"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy ID'}</span>
        </motion.button>
      </div>

      {/* User list animated with AnimatePresence and motion.div. */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 -mr-2">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.userId}
              variants={userItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.04 }} // Staggered delay
              className="flex items-center gap-3"
            >
              <UserCircle className="h-6 w-6 text-neutral-400 flex-shrink-0" />
              <p className="text-sm text-neutral-700 truncate" title={user.userId}>
                {user.userId}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};