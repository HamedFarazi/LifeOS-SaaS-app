import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types/index';

/**
 * Shape of the settings store.
 */
interface SettingsState extends Settings {
  setCurrency: (currency: Settings['currency']) => void;
  setLanguage: (language: Settings['language']) => void;
  setUserName: (userName: string) => void;
  setUserEmail: (userEmail: string) => void;
  /** Set or clear the profile picture (pass undefined to remove). */
  setAvatarImage: (avatarImage: string | undefined) => void;
}

/**
 * Persisted Zustand store holding user preferences in LocalStorage.
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'IRT',
      language: 'fa',
      userName: 'علی',
      userEmail: 'ali@lifeos.app',
      avatarImage: undefined,
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setUserName: (userName) => set({ userName }),
      setUserEmail: (userEmail) => set({ userEmail }),
      setAvatarImage: (avatarImage) => set({ avatarImage }),
    }),
    { name: 'lifeos-settings' }
  )
);
