"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/useRoomStore';
import { FaUserCircle, FaCopy, FaCheck } from 'react-icons/fa';
import { useTransition, animated, useSpring } from '@react-spring/web';

export const UserList = () => {
  const users = useRoomStore((state) => state.users);
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const userTransitions = useTransition(users, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-20px)' },
    keys: item => item.userId,
    trail: 40,
  });

  // Animation for the copy button appearing
  const copyButtonAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 300, friction: 15 },
  });

  return (
    <div className="h-full rounded-lg bg-gradient-to-tr from-orange-200 via-transparent to-red-400 border border-purple-800 p-4 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-300">In Room ({users.length})</h3>
        {/* ✨ NEW FEATURE: Copy Room ID Button ✨ */}
        <animated.button
          style={copyButtonAnimation}
          onClick={handleCopy}
          className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs transition-all duration-200 ease-in-out ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 text-purple-100 hover:bg-purple-500'
          }`}
          title="Copy Room ID"
        >
          {copied ? <FaCheck /> : <FaCopy />}
          <span>{copied ? 'Copied!' : 'Copy ID'}</span>
        </animated.button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {userTransitions((style, user) => (
          <animated.div style={style} key={user.userId} className="flex items-center gap-3">
            <FaUserCircle className="h-6 w-6 text-purple-400" />
            <p className="text-sm text-gray-300 truncate" title={user.userId}>
              {user.userId.substring(0, 12)}...
            </p>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

