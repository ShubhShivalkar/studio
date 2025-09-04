import { create } from 'zustand';

type OnboardingState = {
  phone: string;
  countryCode: string;
  name: string;
  gender: string;
  dob: string;
  avatar: string;
  setData: (data: Partial<OnboardingState>) => void;
  reset: () => void;
};

const useOnboardingStore = create<OnboardingState>((set) => ({
  phone: '',
  countryCode: '91', // Default to IN
  name: '',
  gender: 'Prefer not to say',
  dob: '',
  avatar: '',
  setData: (data) => set((state) => ({ ...state, ...data })),
  reset: () => set({ phone: '', countryCode: '91', name: '', gender: 'Prefer not to say', dob: '', avatar: '' }),
}));

export default useOnboardingStore;
