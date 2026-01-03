import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";

function getLocale() {
    const userLocale = new Intl.Locale(navigator.language).language;
    if (userLocale === "cs") {
        return userLocale;
    }
    return "en";
}

function loadLocaleData(locale: string) {
    switch (locale) {
        case "cs":
            return import("./app/lang/cs.json");
        default:
            return import("./app/lang/en.json");
    }
}

async function bootstrap() {
    const locale = getLocale();
    const messages = await loadLocaleData(locale);
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App messages={messages.default} locale={locale} />
        </StrictMode>,
    );
}

await bootstrap();
