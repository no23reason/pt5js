import type { FC } from "react";
import "./CodePreviewBlock.css";

export const CodePreviewBlock: FC<{ lines: ReadonlyArray<string> }> = ({ lines }) => {
    return <pre className="code-preview-block">{lines.join("\n")}</pre>;
};
