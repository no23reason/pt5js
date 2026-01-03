import type { FC } from "react";
import { FormattedMessage } from "react-intl";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";
import { useAppState } from "../hooks/useAppState.ts";

export const SavePt5Button: FC = () => {
    const serialized = useConvertedPt5();
    const ncpFileName = useAppState((state) => state.ncpFileName);

    const handleSave = () => {
        const content = serialized.join("\r\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${ncpFileName.split(".", 1)[0]}.pt5`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    };

    return (
        <button disabled={!serialized.length} onClick={handleSave}>
            <FormattedMessage defaultMessage="Save .pt5" id="savePt5Button.savePt5" />
        </button>
    );
};
