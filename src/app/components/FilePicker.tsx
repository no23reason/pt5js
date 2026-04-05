import type { FC } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import { parsePt5 } from "../../formats/pt5/parser.ts";
import { serializePt5 } from "../../formats/pt5/serializer.ts";
import { FilePickerButton } from "./FilePickerButton.tsx";

function stripPt5(text: string): string {
    const parsed = parsePt5(text.split("\n"));
    return [...serializePt5(parsed)]
        .filter((line) => line !== "%")
        .map((line) =>
            line
                .replace(/^N\d+\s+/, "") // strip line number
                .replace(/\s+M91/, "") // strip M91 pseudo-arg
                .replace(/\s+(M00|M02|M30)$/, "") // strip trailing stop command
                .trim(),
        )
        .filter(Boolean)
        .join("\n");
}

export const FilePicker: FC = () => {
    const setNcpFile = useAppState((state) => state.setNcpFile);
    const clearNcpFile = useAppState((state) => state.clearNcpFile);
    const setPt5Text = useAppState((state) => state.setPt5Text);

    const onNcpFileSelect = (content: string, fileName: string) => {
        setNcpFile(fileName, content.split("\n"));
    };

    const onPt5FileSelect = (content: string) => {
        clearNcpFile();
        setPt5Text(stripPt5(content));
    };

    return (
        <>
            <FilePickerButton accept=".ncp" messageId="filePicker.loadNcp" onFileSelect={onNcpFileSelect} />
            <FilePickerButton accept=".pt5" messageId="filePicker.loadPt5" onFileSelect={onPt5FileSelect} />
        </>
    );
};
