import "./App.css";
import { type FC, useState } from "react";
import { FilePicker } from "./app/components/FilePicker.tsx";
import { SavePt5Button } from "./app/components/SavePt5Button.tsx";
import { NcpPreview } from "./app/components/NcpPreview.tsx";
import { Pt5Preview } from "./app/components/Pt5Preview.tsx";
import { useAppState } from "./app/hooks/useAppState.ts";
import { FormattedMessage, IntlProvider } from "react-intl";
import { DrawingPreview } from "./app/components/DrawingPreview.tsx";
import { Hints } from "./app/components/Hints.tsx";

interface AppProps {
    messages: Record<string, string>;
    locale: string;
}

export const App: FC<AppProps> = ({ messages, locale }) => {
    const ncpLines = useAppState((state) => state.ncpLines);
    const pt5Text = useAppState((state) => state.pt5Text);
    const [showNcp, setShowNcp] = useState(false);
    return (
        <IntlProvider messages={messages} locale={locale}>
            <div className="controls-container">
                <FilePicker />
                <SavePt5Button />
                {ncpLines?.length > 0 && (
                    <button onClick={() => setShowNcp((v) => !v)}>
                        <FormattedMessage id={showNcp ? "ncpPreview.hide" : "ncpPreview.show"} />
                    </button>
                )}
            </div>
            <Hints />
            <div className="previews-container">
                {showNcp && <NcpPreview />}
                <Pt5Preview />
                {pt5Text && <DrawingPreview />}
            </div>
        </IntlProvider>
    );
};
