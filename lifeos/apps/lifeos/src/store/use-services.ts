import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service } from '../types/index';
import { SEED_SERVICES } from '../data/seed';

/**
 * Shape of the services store.
 */
interface ServicesState {
  services: Service[];
  /** Add a new service (id + createdAt are generated if missing). */
  addService: (
    input: Omit<Service, 'id' | 'createdAt'> & Partial<Pick<Service, 'id' | 'createdAt'>>
  ) => void;
  /** Update an existing service by id. */
  updateService: (id: string, patch: Partial<Service>) => void;
  /** Remove a service by id. */
  removeService: (id: string) => void;
  /** Toggle the active flag of a service. */
  toggleActive: (id: string) => void;
  /** Replace the entire collection (used by data import). */
  replaceAll: (services: Service[]) => void;
  /** Restore the seed dataset. */
  reset: () => void;
}

/**
 * Generates a reasonably unique id for a new service.
 */
function genId(): string {
  return `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Persisted Zustand store holding all managed services in LocalStorage.
 */
export const useServices = create<ServicesState>()(
  persist(
    (set) => ({
      services: SEED_SERVICES,
      addService: (input) =>
        set((state) => ({
          services: [
            {
              ...input,
              id: input.id ?? genId(),
              createdAt: input.createdAt ?? new Date().toISOString(),
            },
            ...state.services,
          ],
        })),
      updateService: (id, patch) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      removeService: (id) =>
        set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
      toggleActive: (id) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, active: !s.active } : s
          ),
        })),
      replaceAll: (services) => set({ services }),
      reset: () => set({ services: SEED_SERVICES }),
    }),
    { name: 'lifeos-services' }
  )
);
