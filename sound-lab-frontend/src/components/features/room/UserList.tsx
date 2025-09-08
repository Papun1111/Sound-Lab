"use client";

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { FaUserCircle } from 'react-icons/fa';

export const UserList = () => {
  const users = useRoomStore((state) => state.users);

  return (
    <div className="h-full rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">In Room ({users.length})</h3>
      <div className="space-y-3 overflow-y-auto">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <FaUserCircle className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-300 truncate" title={user.userId}>
              {/* In a real app, you'd show a username */}
              {user.userId.substring(0, 12)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};