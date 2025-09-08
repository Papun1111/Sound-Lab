import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
}

// ✨ FIX: Add a status to know if we are loading, authenticated, or not.
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  token: string | null;
  user: User | null;
  authStatus: AuthStatus;
}

interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      authStatus: 'loading', // Start in a loading state

      login: (token: string) => {
        try {
          const user = jwtDecode<User>(token);
          set({ token, user, authStatus: 'authenticated' });
        } catch (error) {
          console.error("Failed to decode JWT:", error);
          get().logout();
        }
      },

      logout: () => {
        set({ token: null, user: null, authStatus: 'unauthenticated' });
      },
      
      initializeAuth: () => {
        const { token } = get();
        if (token) {
           get().login(token);
        } else {
           // If no token is found, we know the user is unauthenticated
           set({ authStatus: 'unauthenticated' });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);