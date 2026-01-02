import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";

export const NcpPreview: FC = () => {
    const ncpFile = useAppState((state) => state.ncpFile);

    return <pre>{ncpFile}</pre>;
};
