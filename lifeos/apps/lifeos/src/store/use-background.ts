import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BgType = 'default' | 'image' | 'ballpit' | 'hyperspeed' | 'galaxy';

export interface BackgroundState {
  type: BgType;
  imageUrl: string | null;   // URL for selected image bg
  setType: (type: BgType) => void;
  setImageUrl: (url: string | null) => void;
  reset: () => void;
}

export const useBackground = create<BackgroundState>()(
  persist(
    (set) => ({
      type:     'default',
      imageUrl: null,
      setType:  (type)     => set({ type }),
      setImageUrl: (imageUrl) => set({ imageUrl }),
      reset: () => set({ type: 'default', imageUrl: null }),
    }),
    { name: 'lifeos-background' }
  )
);
