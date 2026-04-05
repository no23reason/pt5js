import type { FC } from "react";
import { FormattedMessage } from "react-intl";
import { useAppState } from "../hooks/useAppState.ts";

function withPt5Metadata(text: string): string {
    let lineNum = 1;
    const lines: string[] = [];

    for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^G0[123]/.test(trimmed)) {
            lines.push(`N${lineNum++} ${trimmed}`);
        } else {
            lines.push(trimmed);
        }
    }

    const motionIndices = lines.reduce<number[]>((acc, l, i) => {
        if (/^N\d+\s+G0[123]/.test(l)) acc.push(i);
        return acc;
    }, []);

    if (motionIndices.length > 0) {
        lines[motionIndices[0]] += " M91";
        lines[motionIndices[motionIndices.length - 1]] += " M30";
    }

    return ["%", ...lines].join("\r\n");
}

export const SavePt5Button: FC = () => {
    const pt5Text = useAppState((state) => state.pt5Text);
    const ncpFileName = useAppState((state) => state.ncpFileName);

    const handleSave = () => {
        const content = withPt5Metadata(pt5Text);
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
