import type { FC, FormEvent } from "react";
import { useRef } from "react";
import { useAppState } from "../hooks/useAppState.ts";
import { FormattedMessage } from "react-intl";

export const FilePicker: FC = () => {
    const setNcpFile = useAppState((state) => state.setNcpFile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onInput = async (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);
        const content = await file?.text();

        if (!content) {
            return;
        }

        setNcpFile(file?.name ?? "file.ncp", content.split("\n"));
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
            <button onClick={handleClick}>
                <FormattedMessage id="filePicker.loadNcp" />
            </button>
        </>
    );
};
