interface Video {
  id: string;
  youtubeId: string;
  title: string;
  duration: number;
  addedBy: string;
  votes: Set<string>;
}

interface PlaybackState {
  video: Video;
  isPlaying: boolean;
  startedAtTimestamp: number;
  seekTime: number;
}

interface Room {
  id: string;
  users: Map<string, { userId: string }>;
  queue: Video[];
  currentlyPlaying: PlaybackState | null;
}

const rooms = new Map<string, Room>();

const socketToRoomMap = new Map<string, string>();

export const roomManager = {
  createRoom(roomId: string) {
    if (rooms.has(roomId)) return;
    rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      queue: [],
      currentlyPlaying: null,
    });
  },

  joinRoom(roomId: string, userId: string, socketId: string) {
    this.createRoom(roomId);
    const room = rooms.get(roomId)!;
    room.users.set(socketId, { userId });
    socketToRoomMap.set(socketId, roomId);
  },

  leaveRoom(socketId: string): Room | undefined {
    const roomId = socketToRoomMap.get(socketId);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socketId);
      socketToRoomMap.delete(socketId);

      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
      return room;
    }
  },

  getRoomState(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return null;

    return {
      ...room,
      users: Array.from(room.users.values()),
      queue: room.queue.map(video => ({
        ...video,
        votes: Array.from(video.votes),
      })),
    };
  },

  addVideo(roomId: string, videoData: Omit<Video, 'votes'>) {
    const room = rooms.get(roomId);
    if (!room) return;

    const newVideo: Video = { ...videoData, votes: new Set() };
    room.queue.push(newVideo);
  },

  voteForVideo(roomId: string, userId: string, videoId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const video = room.queue.find(v => v.id === videoId);
    if (!video) return;

    if (video.votes.has(userId)) {
      video.votes.delete(userId);
    } else {
      video.votes.add(userId);
    }

    room.queue.sort((a, b) => b.votes.size - a.votes.size);
  },
  
  startNextVideo(roomId: string) {
    const room = rooms.get(roomId);
    if (!room || room.queue.length === 0) {
        if(room) room.currentlyPlaying = null;
        return;
    }

    const nextVideo = room.queue.shift()!;
    room.currentlyPlaying = {
      video: nextVideo,
      isPlaying: true,
      startedAtTimestamp: Date.now(),
      seekTime: 0,
    };
  },
  
  // ✨ NEW FUNCTION TO HANDLE REAL-TIME SYNC ✨
  // This function updates the playback state (play, pause, seek) for a room.
  updatePlaybackState(roomId: string, newState: Partial<PlaybackState>) {
    const room = rooms.get(roomId);
    if (room && room.currentlyPlaying) {
      // Merge the new state properties (like `isPlaying` or `seekTime`)
      // into the existing currentlyPlaying object.
      room.currentlyPlaying = { ...room.currentlyPlaying, ...newState };
    }
  },
};
