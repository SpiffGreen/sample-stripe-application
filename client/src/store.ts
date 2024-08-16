import { create } from "zustand";

type User = {
  id: number;
  email: string;
  name: string;
  balance: number;
};

type AppStoreData = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useAppStore = create<AppStoreData>((set) => ({
  user: null,
  setUser: (userData: User | null) => set({ user: userData }),
}));
