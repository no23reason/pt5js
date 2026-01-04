import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import { CodePreviewBlock } from "./CodePreviewBlock.tsx";

export const NcpPreview: FC = () => {
    const ncpLines = useAppState((state) => state.ncpLines);
    const ncpFileName = useAppState((state) => state.ncpFileName);

    return (
        <div>
            <h2>{ncpFileName}</h2>
            <CodePreviewBlock lines={ncpLines} />
        </div>
    );
};
