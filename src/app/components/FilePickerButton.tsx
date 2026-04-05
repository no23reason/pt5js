import type { FC, FormEvent } from "react";
import { useRef } from "react";
import { FormattedMessage } from "react-intl";

export const FilePickerButton: FC<{
    messageId: string;
    accept: string;
    onFileSelect: (content: string, fileName: string) => void;
}> = ({ messageId, onFileSelect, accept }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onInput = async (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);
        const content = await file?.text();

        if (!content) {
            return;
        }

        onFileSelect(content, file!.name);
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
                accept={accept}
                style={{ display: "none" }}
            />
            <button onClick={handleClick}>
                <FormattedMessage id={messageId} />
            </button>
        </>
    );
};
