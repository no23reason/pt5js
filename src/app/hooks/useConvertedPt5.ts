import { useAppState } from "./useAppState.ts";
import { ncpToPt5 } from "../../formats/conversion/ncpToPt5.ts";
import { parseNcp } from "../../formats/ncp/parser.ts";
import { serializePt5 } from "../../formats/pt5/serializer.ts";

export const useConvertedPt5 = () => {
    const ncpLines = useAppState((state) => state.ncpLines);
    const parsed = ncpLines.length > 0 ? parseNcp(ncpLines) : undefined;
    const converted = parsed && ncpToPt5(parsed);
    return converted ? [...serializePt5(converted)] : [];
};
