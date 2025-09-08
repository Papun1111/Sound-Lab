const rooms = new Map();
const socketToRoomMap = new Map();
export const roomManager = {
    createRoom(roomId) {
        if (rooms.has(roomId))
            return;
        rooms.set(roomId, {
            id: roomId,
            users: new Map(),
            queue: [],
            currentlyPlaying: null,
        });
    },
    joinRoom(roomId, userId, socketId) {
        this.createRoom(roomId);
        const room = rooms.get(roomId);
        room.users.set(socketId, { userId });
        socketToRoomMap.set(socketId, roomId);
    },
    leaveRoom(socketId) {
        const roomId = socketToRoomMap.get(socketId);
        if (!roomId)
            return;
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
    getRoomState(roomId) {
        const room = rooms.get(roomId);
        if (!room)
            return null;
        return {
            ...room,
            users: Array.from(room.users.values()),
            queue: room.queue.map(video => ({
                ...video,
                votes: Array.from(video.votes),
            })),
        };
    },
    addVideo(roomId, videoData) {
        const room = rooms.get(roomId);
        if (!room)
            return;
        const newVideo = { ...videoData, votes: new Set() };
        room.queue.push(newVideo);
    },
    voteForVideo(roomId, userId, videoId) {
        const room = rooms.get(roomId);
        if (!room)
            return;
        const video = room.queue.find(v => v.id === videoId);
        if (!video)
            return;
        if (video.votes.has(userId)) {
            video.votes.delete(userId);
        }
        else {
            video.votes.add(userId);
        }
        room.queue.sort((a, b) => b.votes.size - a.votes.size);
    },
    startNextVideo(roomId) {
        const room = rooms.get(roomId);
        if (!room || room.queue.length === 0) {
            if (room)
                room.currentlyPlaying = null;
            return;
        }
        const nextVideo = room.queue.shift();
        room.currentlyPlaying = {
            video: nextVideo,
            isPlaying: true,
            startedAtTimestamp: Date.now(),
            seekTime: 0,
        };
    },
};
