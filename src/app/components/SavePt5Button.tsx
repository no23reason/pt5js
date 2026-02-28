import type { FC } from "react";
import { FormattedMessage } from "react-intl";
import { useAppState } from "../hooks/useAppState.ts";

export const SavePt5Button: FC = () => {
    const pt5Text = useAppState((state) => state.pt5Text);
    const ncpFileName = useAppState((state) => state.ncpFileName);

    const handleSave = () => {
        let lineNum = 1;
        const content = pt5Text
            .split("\n")
            .map((line) => (/^G0[123]/.test(line.trim()) ? `N${lineNum++} ${line.trim()}` : line))
            .join("\r\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = ncpFileName ? `${ncpFileName.split(".", 1)[0]}.pt5` : "output.pt5";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    };

    return (
        <button disabled={!pt5Text} onClick={handleSave}>
            <FormattedMessage id="savePt5Button.savePt5" />
        </button>
    );
};
