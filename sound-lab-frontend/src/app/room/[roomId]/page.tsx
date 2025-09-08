"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useRoomSocket } from '@/app/hooks/useRoomSocket';
import { useAuthStore } from '@/store/useAuthStore';
import { useRoomStore } from '@/store/useRoomStore'; 

import { Player } from '@/components/features/room/Player';
import { Queue } from '@/components/features/room/Queue';
import { UserList } from '@/components/features/room/UserList';
import { Spinner } from '@/components/ui/Spinner';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  // ✨ FIX: Use the new authStatus for more reliable checks
  const { authStatus, initializeAuth } = useAuthStore();
  const isConnected = useRoomStore((state) => state.isConnected);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // ✨ FIX: Only redirect if we are certain the user is unauthenticated
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  const socket = useRoomSocket(roomId);
  
  // ✨ FIX: Show a loading state while auth is loading OR there's no roomId
  if (authStatus === 'loading' || !roomId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (authStatus !== 'authenticated' || !isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Connecting to room...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 lg:p-6">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Player socket={socket}  />
        </div>
        <div className="flex h-[85vh] flex-col gap-6">
          <div className="flex-grow">
            <Queue socket={socket}  />
          </div>
          <div className="flex-shrink-0">
            <div className="h-[20vh] min-h-[150px]">
              <UserList />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}