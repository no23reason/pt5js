import type { FC, FormEvent } from "react";
import { useAppState } from "../hooks/useAppState.ts";

export const FilePicker: FC = () => {
    const setNcpFile = useAppState((state) => state.setNcpFile);

    const onInput = async (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);
        const content = await file?.text();

        if (!content) {
            return;
        }

        setNcpFile(content);
    };

    return (
        <div>
            <input type="file" onInput={onInput} />
        </div>
    );
};
