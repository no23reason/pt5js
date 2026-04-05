import { create } from "zustand";
import { parseNcp } from "../../formats/ncp/parser.ts";
import { ncpToPt5 } from "../../formats/conversion/ncpToPt5.ts";
import { serializePt5 } from "../../formats/pt5/serializer.ts";

export interface AppState {
    ncpFileName: string;
    ncpLines: string[];
    pt5Text: string;
    ncpLoadCount: number;
    setNcpFile: (name: string, lines: string[]) => void;
    clearNcpFile: () => void;
    setPt5Text: (text: string) => void;
}

export const useAppState = create<AppState>((set) => ({
    ncpFileName: "",
    ncpLines: [],
    pt5Text: "",
    ncpLoadCount: 0,
    setNcpFile: (name: string, lines: string[]) => {
        const parsed = parseNcp(lines);
        const converted = ncpToPt5(parsed);
        const pt5Text = [...serializePt5(converted)]
            .filter((line) => line !== "%")
            .map((line) =>
                line
                    .replace(/^N\d+\s+/, "") // strip line number
                    .replace(/\s+M91/, "") // strip M91 pseudo-arg
                    .replace(/\s+(M00|M02|M30)$/, "") // strip trailing stop command
                    .trim(),
            )
            .filter(Boolean)
            .join("\n");
        set((state) => ({
            ncpLines: lines,
            ncpFileName: name,
            pt5Text,
            ncpLoadCount: state.ncpLoadCount + 1,
        }));
    },
    clearNcpFile: () => {
        set((state) => ({
            ncpLines: [],
            ncpFileName: "",
            ncpLoadCount: state.ncpLoadCount + 1,
        }));
    },
    setPt5Text: (text: string) => set({ pt5Text: text }),
}));
