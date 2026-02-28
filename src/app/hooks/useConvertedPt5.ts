import { useAppState } from "./useAppState.ts";
import { parsePt5 } from "../../formats/pt5/parser.ts";
import type { Pt5File } from "../../formats/pt5/model.ts";

export const useConvertedPt5 = (): Pt5File | undefined => {
    const pt5Text = useAppState((state) => state.pt5Text);
    if (!pt5Text.trim()) return undefined;
    return parsePt5(pt5Text.split("\n"));
};
