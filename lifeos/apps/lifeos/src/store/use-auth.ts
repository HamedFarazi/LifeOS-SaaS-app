import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login:    (name: string, email: string, password: string, remember?: boolean) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout:   () => void;
}

const STORAGE_KEY = 'lifeos-auth';

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (name, email, _password, _remember = true) => {
        // Fake auth — any non-empty email/password works
        if (!email.trim() || !_password.trim()) return false;
        const user: AuthUser = {
          id:        `user-${Date.now()}`,
          name:      name || email.split('@')[0],
          email:     email.trim().toLowerCase(),
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      register: (name, email, _password) => {
        if (!name.trim() || !email.trim() || !_password.trim()) return false;
        const user: AuthUser = {
          id:        `user-${Date.now()}`,
          name:      name.trim(),
          email:     email.trim().toLowerCase(),
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
