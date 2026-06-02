import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id?: string;
  username: string;
  roles: string[];
  plant_codes: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      updateToken: (token) => set({ token }),
    }),
    {
      name: 'factorynxt-auth',
    }
  )
);
