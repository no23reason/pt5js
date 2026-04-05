import type { FC } from "react";
import { useRef } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import "./Pt5Preview.css";

function getGutterLabels(text: string): string[] {
    let lineNum = 1;
    return text.split("\n").map((line) => {
        if (/^G0[123]|G92/.test(line.trim())) {
            return `N${lineNum++}`;
        }
        return "";
    });
}

export const Pt5Preview: FC = () => {
    const pt5Text = useAppState((state) => state.pt5Text);
    const setPt5Text = useAppState((state) => state.setPt5Text);
    const ncpFileName = useAppState((state) => state.ncpFileName);
    const gutterRef = useRef<HTMLPreElement>(null);

    const gutterLabels = getGutterLabels(pt5Text);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    return (
        <div>
            <h2>{ncpFileName ? `${ncpFileName.split(".", 1)[0]}.pt5` : "PT5 Editor"}</h2>
            <div className="pt5-editor-wrapper">
                <pre ref={gutterRef} className="pt5-editor-gutter">
                    {gutterLabels.join("\n")}
                </pre>
                <textarea
                    value={pt5Text}
                    onChange={(e) => setPt5Text(e.target.value)}
                    onScroll={handleScroll}
                    className="pt5-editor-textarea"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};
