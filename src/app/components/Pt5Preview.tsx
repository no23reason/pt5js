import type { FC } from "react";
import { CodePreviewBlock } from "./CodePreviewBlock.tsx";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";

export const Pt5Preview: FC = () => {
    const serialized = useConvertedPt5();

    return (
        <div>
            <h2>PT5</h2>
            <CodePreviewBlock lines={serialized} />
        </div>
    );
};
