import { create } from 'zustand';
import type { Tribe } from '@/lib/types';

type TribeState = {
  tribe: Tribe | null;
  setTribe: (tribe: Tribe) => void;
  clearTribe: () => void;
};

const useTribeStore = create<TribeState>((set) => ({
  tribe: null,
  setTribe: (tribe) => set({ tribe }),
  clearTribe: () => set({ tribe: null }),
}));

export default useTribeStore;
