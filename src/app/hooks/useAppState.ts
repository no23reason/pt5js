import { create } from "zustand";

export interface AppState {
    ncpLines: string[];
    setNcpLines: (newNcpLines: string[]) => void;
}

export const useAppState = create<AppState>((set) => ({
    ncpLines: [],
    setNcpLines: (newNcpLines: string[]) => set({ ncpLines: newNcpLines }),
}));
