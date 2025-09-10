import { create } from 'zustand';

// --- STATE SHAPES (mirroring the backend) ---

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  duration: number;
  addedBy: string;
  votes: string[];
}

interface PlaybackState {
  video: Video;
  isPlaying: boolean;
  startedAtTimestamp: number;
  seekTime: number;
}

interface User {
  userId: string;
}

// --- ZUSTAND STORE DEFINITION ---

export interface RoomState {
  roomId: string | null;
  users: User[];
  queue: Video[];
  currentlyPlaying: PlaybackState | null;
  isConnected: boolean;
}

interface RoomActions {
  setRoomState: (state: Partial<RoomState> | null) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  clearRoomState: () => void;
}

const initialState: RoomState = {
  roomId: null,
  users: [],
  queue: [],
  currentlyPlaying: null,
  isConnected: false,
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,

  setRoomState: (state) => {
    if (state) {
      // ✨ THE DEFINITIVE FIX:
      // This logic checks if the incoming update is a partial `currentlyPlaying`
      // state. If so, it correctly merges it with the existing `currentlyPlaying`
      // object instead of replacing it. This prevents the video data from being lost.
      set((prevState) => {
        const newCurrentlyPlaying = state.currentlyPlaying
          ? { ...prevState.currentlyPlaying, ...state.currentlyPlaying }
          : state.currentlyPlaying === null ? null : prevState.currentlyPlaying;

        return {
          ...prevState,
          ...state,
          currentlyPlaying: newCurrentlyPlaying as PlaybackState | null,
        };
      });
    } else {
      set(initialState);
    }
  },

  setConnectionStatus: (isConnected) => {
    set({ isConnected });
  },

  clearRoomState: () => {
    set({ ...initialState, isConnected: false });
  },
}));
