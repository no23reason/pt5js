import type { FC } from "react";
import { CodePreviewBlock } from "./CodePreviewBlock.tsx";
import { useSerializedPt5 } from "../hooks/useSerializedPt5.ts";

export const Pt5Preview: FC = () => {
    const serialized = useSerializedPt5();

    return (
        <div>
            <h2>PT5</h2>
            <CodePreviewBlock lines={serialized} />
        </div>
    );
};
