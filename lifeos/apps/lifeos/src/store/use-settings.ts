import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types/index';

interface SettingsState extends Settings {
  setCurrency: (currency: Settings['currency']) => void;
  setLanguage: (language: Settings['language']) => void;
  setUserName: (userName: string) => void;
  setUserEmail: (userEmail: string) => void;
  setAvatarImage: (avatarImage: string | undefined) => void;
  setThemeMode: (themeMode: Settings['themeMode']) => void;
  setMonthlyBudget: (budget: number | undefined) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'IRT',
      language: 'fa',
      userName: 'علی',
      userEmail: 'ali@trackly.app',
      avatarImage: undefined,
      themeMode: 'dark',
      monthlyBudget: undefined,
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setUserName: (userName) => set({ userName }),
      setUserEmail: (userEmail) => set({ userEmail }),
      setAvatarImage: (avatarImage) => set({ avatarImage }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),
    }),
    { name: 'lifeos-settings' }
  )
);
