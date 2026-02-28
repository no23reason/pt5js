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
            .map((line) => line.replace(/^N\d+\s+/, ""))
            .join("\n");
        set((state) => ({
            ncpLines: lines,
            ncpFileName: name,
            pt5Text,
            ncpLoadCount: state.ncpLoadCount + 1,
        }));
    },
    setPt5Text: (text: string) => set({ pt5Text: text }),
}));
