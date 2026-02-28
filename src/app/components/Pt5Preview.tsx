import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import "./CodePreviewBlock.css";

export const Pt5Preview: FC = () => {
    const pt5Text = useAppState((state) => state.pt5Text);
    const setPt5Text = useAppState((state) => state.setPt5Text);
    const ncpFileName = useAppState((state) => state.ncpFileName);

    return (
        <div>
            <h2>{ncpFileName ? `${ncpFileName.split(".", 1)[0]}.pt5` : "PT5 Editor"}</h2>
            <textarea
                value={pt5Text}
                onChange={(e) => setPt5Text(e.target.value)}
                className="pt5-editor"
                spellCheck={false}
            />
        </div>
    );
};
