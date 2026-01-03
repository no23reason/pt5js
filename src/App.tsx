import "./App.css";
import type { FC } from "react";
import { FilePicker } from "./app/components/FilePicker.tsx";
import { SavePt5Button } from "./app/components/SavePt5Button.tsx";
import { NcpPreview } from "./app/components/NcpPreview.tsx";
import { Pt5Preview } from "./app/components/Pt5Preview.tsx";
import { useAppState } from "./app/hooks/useAppState.ts";
import { IntlProvider } from "react-intl";

interface AppProps {
    messages: Record<string, string>;
    locale: string;
}

export const App: FC<AppProps> = ({ messages, locale }) => {
    const ncpLines = useAppState((state) => state.ncpLines);
    return (
        <IntlProvider messages={messages} locale={locale}>
            <div className="controls-container">
                <FilePicker />
                <SavePt5Button />
            </div>
            {ncpLines?.length > 0 && (
                <div className="previews-container">
                    <NcpPreview />
                    <Pt5Preview />
                </div>
            )}
        </IntlProvider>
    );
};
