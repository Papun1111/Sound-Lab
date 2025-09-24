"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Animation and Icons
import { useTransition, animated } from "@react-spring/web";
import { FaHome } from "react-icons/fa";

// Hooks and State Management
import { useRoomSocket } from "@/app/hooks/useRoomSocket";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoomStore } from "@/store/useRoomStore";

// Feature Components
import { Player } from "@/components/features/room/Player";
import { Queue } from "@/components/features/room/Queue";
import { UserList } from "@/components/features/room/UserList";
import { Spinner } from "@/components/ui/Spinner";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;

  const { authStatus, initializeAuth } = useAuthStore();
  const isConnected = useRoomStore((state) => state.isConnected);
  const [show, setShow] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  const socket = useRoomSocket(roomId);

  // Set show to true once connected to trigger the animation
  useEffect(() => {
    if (isConnected && authStatus === "authenticated") {
      setShow(true);
    }
  }, [isConnected, authStatus]);

  // Animation for the main layout
  const transitions = useTransition(show, {
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    config: { tension: 220, friction: 40 },
  });

  if (authStatus === "loading" || !roomId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (authStatus !== "authenticated" || !isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Connecting to room...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-l from-gray-900 via-rose-700 to-black p-4 lg:p-6">
      {transitions(
        (style, item) =>
          item && (
            <animated.div style={style}>
              <header className="mx-auto max-w-screen-xl mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-lime-200 to-neutral-900 bg-clip-text text-transparent">
                  Sound Lab Room
                </h1>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-md bg-gradient-to-tr
from-gray-900
via-rose-700
to-black px-3 py-2 text-sm text-white transition-colors hover:bg-purple-500"
                >
                  <FaHome />
                  <span className="bg-gray bg-gradient-to-r from-lime-200 to-neutral-900 bg-clip-text text-transparent">
                    Home
                  </span>
                </Link>
              </header>
              <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Player socket={socket} />
                </div>
                <div className="flex h-[85vh] flex-col gap-6">
                  <div className="flex-grow">
                    <Queue socket={socket} />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-[20vh] min-h-[150px]">
                      <UserList />
                    </div>
                  </div>
                </div>
              </div>
            </animated.div>
          )
      )}
    </main>
  );
}
