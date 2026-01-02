import { create } from "zustand";

export interface AppState {
    ncpFile: string;
    setNcpFile: (newNcpFile: string) => void;
}

export const useAppState = create<AppState>((set) => ({
    ncpFile: "",
    setNcpFile: (newNcpFile: string) => set({ ncpFile: newNcpFile }),
}));
