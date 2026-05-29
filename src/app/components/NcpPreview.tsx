import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import { CodePreviewBlock } from "./CodePreviewBlock.tsx";

export const NcpPreview: FC = () => {
    const ncpLines = useAppState((state) => state.ncpLines);
    const fileName = useAppState((state) => state.fileName);

    return (
        <div>
            <h2>{`${fileName}.ncp`}</h2>
            <CodePreviewBlock lines={ncpLines} />
        </div>
    );
};
