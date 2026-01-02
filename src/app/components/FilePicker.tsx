import type { FC, FormEvent } from "react";
import { useRef } from "react";
import { useAppState } from "../hooks/useAppState.ts";

export const FilePicker: FC = () => {
    const setNcpLines = useAppState((state) => state.setNcpLines);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onInput = async (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);
        const content = await file?.text();

        if (!content) {
            return;
        }

        setNcpLines(content.split("\n"));
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                onInput={onInput}
                accept=".ncp"
                style={{ display: "none" }}
            />
            <button onClick={handleClick}>Load .ncp</button>
        </>
    );
};
