import "./App.css";
import { FilePicker } from "./app/components/FilePicker.tsx";
import { NcpPreview } from "./app/components/NcpPreview.tsx";
import { Pt5Preview } from "./app/components/Pt5Preview.tsx";

function App() {
    return (
        <>
            <FilePicker />
            <NcpPreview />
            <Pt5Preview />
        </>
    );
}

export default App;
