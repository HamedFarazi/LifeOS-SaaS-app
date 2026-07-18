import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal } from '../types/index';

interface GoalsState {
  goals: Goal[];
  addGoal: (input: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  deposit: (id: string, amount: number) => void;
}

function genId(): string {
  return `goal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const SEED_GOALS: Goal[] = [
  {
    id: 'goal-laptop',
    title: 'خرید لپ‌تاپ',
    targetAmount: 50_000_000,
    savedAmount: 18_000_000,
    currency: 'IRT',
    color: '#8B5CF6',
    icon: 'laptop',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'goal-travel',
    title: 'سفر کیش',
    targetAmount: 20_000_000,
    savedAmount: 8_500_000,
    currency: 'IRT',
    color: '#22D3EE',
    icon: 'plane',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'goal-emergency',
    title: 'صندوق اضطراری',
    targetAmount: 100_000_000,
    savedAmount: 35_000_000,
    currency: 'IRT',
    color: '#34D399',
    icon: 'shield',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: SEED_GOALS,
      addGoal: (input) =>
        set((state) => ({
          goals: [
            { ...input, id: genId(), createdAt: new Date().toISOString() },
            ...state.goals,
          ],
        })),
      updateGoal: (id, patch) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
      deposit: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g
          ),
        })),
    }),
    { name: 'lifeos-goals' }
  )
);
