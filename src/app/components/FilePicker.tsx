import type { FC, FormEvent } from "react";
import { useAppState } from "../hooks/useAppState.ts";

export const FilePicker: FC = () => {
    const setNcpLines = useAppState((state) => state.setNcpLines);

    const onInput = async (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);
        const content = await file?.text();

        if (!content) {
            return;
        }

        setNcpLines(content.split("\n"));
    };

    return (
        <div>
            <input type="file" onInput={onInput} accept=".ncp" />
        </div>
    );
};
