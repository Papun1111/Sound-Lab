import { apiClient } from '@/lib/axios';

// Define types for API function arguments for better type safety
interface AuthCredentials {
  email?: string;
  username?: string;
  password?: string;
}

interface AuthResponse {
  token: string;
}

/**
 * Sends a signup request to the backend.
 */
export const signupUser = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post('/auth/signup', credentials);
  return data;
};

/**
 * Sends a login request and returns the JWT.
 */
export const loginUser = async (credentials: AuthCredentials) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
};

/**
 * Creates a new room. Requires an auth token.
 */
export const createRoom = async (name: string, token: string) => {
  const { data } = await apiClient.post(
    '/rooms',
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

/**
 * Adds a video to a room's queue. Requires an auth token.
 */
export const addVideoToRoom = async (roomId: string, youtubeUrl: string, token: string) => {
  const { data } = await apiClient.post(
    `/rooms/${roomId}/videos`,
    { youtubeUrl },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};