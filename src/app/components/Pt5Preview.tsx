import type { FC } from "react";
import { CodePreviewBlock } from "./CodePreviewBlock.tsx";
import { useSerializedPt5 } from "../hooks/useSerializedPt5.ts";
import { useAppState } from "../hooks/useAppState.ts";

export const Pt5Preview: FC = () => {
    const serialized = useSerializedPt5();
    const ncpFileName = useAppState((state) => state.ncpFileName);

    return (
        <div>
            <h2>{`${ncpFileName.split(".", 1)[0]}.pt5`}</h2>
            <CodePreviewBlock lines={serialized} />
        </div>
    );
};
