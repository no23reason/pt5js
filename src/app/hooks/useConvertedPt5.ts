import { useAppState } from "./useAppState.ts";
import { ncpToPt5 } from "../../formats/conversion/ncpToPt5.ts";
import { parseNcp } from "../../formats/ncp/parser.ts";
import type { Pt5File } from "../../formats/pt5/model.ts";

export const useConvertedPt5 = (): Pt5File | undefined => {
    const ncpLines = useAppState((state) => state.ncpLines);
    const parsed = ncpLines.length > 0 ? parseNcp(ncpLines) : undefined;
    return parsed && ncpToPt5(parsed);
};
