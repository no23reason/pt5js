import { create } from "zustand";

export interface AppState {
    ncpFileName: string;
    ncpLines: string[];
    setNcpFile: (name: string, lines: string[]) => void;
}

export const useAppState = create<AppState>((set) => ({
    ncpFileName: "",
    ncpLines: [],
    setNcpFile: (name: string, lines: string[]) => set({ ncpLines: lines, ncpFileName: name }),
}));
