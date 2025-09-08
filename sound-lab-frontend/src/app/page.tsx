"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { createRoom } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
import Link from 'next/link';

export default function HomePage() {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { authStatus, token, initializeAuth, logout } = useAuthStore();

  // On initial page load, check the auth status from localStorage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authStatus !== 'authenticated' || !token) {
      setError('You must be logged in to create a room.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createRoom(roomName, token);
      const newRoomId = response.data.id;
      // On success, redirect the user to the newly created room
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      let errorMessage = 'Failed to create room. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthLinks = () => (
    <div className="flex items-center gap-4">
      <Link href="/login">
        <Button variant="secondary">Log In</Button>
      </Link>
      <Link href="/signup">
        <Button variant="primary">Sign Up</Button>
      </Link>
    </div>
  );

  const renderUserActions = () => (
    <div className="flex items-center gap-4">
      <Button variant="danger" onClick={logout}>
        Log Out
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-400">SpotTube</h1>
        {authStatus === 'authenticated' ? renderUserActions() : renderAuthLinks()}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h2 className="text-5xl font-extrabold tracking-tight">Watch Together,</h2>
        <h2 className="text-5xl font-extrabold tracking-tight text-indigo-400">Decide Together.</h2>
        <p className="mt-4 max-w-xl text-lg text-gray-400">
          Create a room, invite your friends, and vote on what to watch next. Your synchronized YouTube experience starts here.
        </p>

        {authStatus === 'authenticated' && (
          <form
            onSubmit={handleCreateRoom}
            className="mt-10 w-full max-w-md space-y-4"
          >
            <Input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter a name for your room"
              className="bg-gray-800 border-gray-600 text-center"
              required
              disabled={isLoading}
            />
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Create a Room'}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        )}

        {authStatus === 'unauthenticated' && (
           <div className="mt-10">
             <Link href="/login">
               <Button variant="primary">Get Started</Button>
             </Link>
           </div>
        )}
      </main>
    </div>
  );
}