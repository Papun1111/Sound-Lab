import axios from 'axios';

// Get the backend API URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create an Axios instance with default settings
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});