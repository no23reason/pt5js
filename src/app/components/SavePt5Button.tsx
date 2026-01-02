import type { FC } from "react";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";

export const SavePt5Button: FC = () => {
    const serialized = useConvertedPt5();

    const handleSave = () => {
        const content = serialized.join("\r\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "output.pt5";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    };

    return (
        <button disabled={!serialized.length} onClick={handleSave}>
            Save .pt5
        </button>
    );
};

