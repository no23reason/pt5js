import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import { ncpToPt5 } from "../../formats/conversion/ncpToPt5.ts";
import { parseNcp } from "../../formats/ncp/parser.ts";
import { serializePt5 } from "../../formats/pt5/serializer.ts";

export const Pt5Preview: FC = () => {
    const ncpFile = useAppState((state) => state.ncpFile);
    const parsed = ncpFile ? parseNcp(ncpFile.split("\n")) : undefined;
    const converted = parsed && ncpToPt5(parsed);

    return <pre>{converted ? [...serializePt5(converted)].join("\n") : ""}</pre>;
};
