
import { create } from 'zustand';

type OnboardingState = {
  email: string;
  password: string;
  name: string;
  gender: string;
  dob: string;
  avatar: string;
  setData: (data: Partial<OnboardingState>) => void;
  reset: () => void;
};

const useOnboardingStore = create<OnboardingState>((set) => ({
  email: '',
  password: '',
  name: '',
  gender: 'Prefer not to say',
  dob: '',
  avatar: '',
  setData: (data) => set((state) => ({ ...state, ...data })),
  reset: () => set({ email: '', password: '', name: '', gender: 'Prefer not to say', dob: '', avatar: '' }),
}));

export default useOnboardingStore;
