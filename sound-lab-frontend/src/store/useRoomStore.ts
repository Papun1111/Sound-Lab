import { create } from 'zustand';



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

  /**
   * Updates the room state by merging the new partial state
   * with the existing state.
   */
  setRoomState: (state) => {
    if (state) {
      set((prevState) => ({
        ...prevState,
        ...state,
      }));
    } else {
      // If null is passed, reset to the initial state.
      set(initialState);
    }
  },

  /**
   * Updates the WebSocket connection status.
   */
  setConnectionStatus: (isConnected) => {
    set({ isConnected });
  },

  /**
   * Resets the room state to its initial values when a user leaves.
   */
  clearRoomState: () => {
    set({ ...initialState, isConnected: false });
  },
}));