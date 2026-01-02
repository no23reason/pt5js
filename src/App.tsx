import "./App.css";
import { FilePicker } from "./app/components/FilePicker.tsx";
import { NcpPreview } from "./app/components/NcpPreview.tsx";
import { Pt5Preview } from "./app/components/Pt5Preview.tsx";

function App() {
    return (
        <>
            <FilePicker />
            <div className="previews-container">
                <NcpPreview />
                <Pt5Preview />
            </div>
        </>
    );
}

export default App;
