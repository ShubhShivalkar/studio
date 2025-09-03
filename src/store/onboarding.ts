import { create } from 'zustand';

type OnboardingState = {
  name: string;
  gender: string;
  dob: string;
  avatar: string;
  setData: (data: Partial<OnboardingState>) => void;
  reset: () => void;
};

const useOnboardingStore = create<OnboardingState>((set) => ({
  name: '',
  gender: '',
  dob: '',
  avatar: '',
  setData: (data) => set((state) => ({ ...state, ...data })),
  reset: () => set({ name: '', gender: '', dob: '', avatar: '' }),
}));

export default useOnboardingStore;
