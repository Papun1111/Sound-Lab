import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useRoomStore, RoomState } from '@/store/useRoomStore';

/**
 * A custom React hook to manage the WebSocket connection for a specific room.
 * @param {string | null | undefined} roomId - The ID of the room to connect to.
 */
// ✨ FIX: Allow the roomId parameter to be a string, null, or undefined.
export const useRoomSocket = (roomId: string | null | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);
  const { setRoomState, setConnectionStatus, clearRoomState } = useRoomStore();

  useEffect(() => {
    // This check now gracefully handles the case where roomId is not yet available.
    if (!token || !roomId) {
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => {
      console.log('Socket connected:', socket.id);
      setConnectionStatus(true);
      socket.emit('join_room', roomId);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setConnectionStatus(false);
    };

    const onRoomStateUpdate = (newState: RoomState) => {
      setRoomState(newState);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_state_update', onRoomStateUpdate);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      console.log('Cleaning up socket connection...');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_state_update', onRoomStateUpdate);
      clearRoomState();
    };
  }, [roomId, token, setConnectionStatus, setRoomState, clearRoomState]);

  return socketRef.current;
};