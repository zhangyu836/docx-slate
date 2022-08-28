
import { useSlate } from 'slate-react';
import saveAs from "file-saver";

const SaveFile = () => {
    let editor = useSlate();
    const handleClick = () => {
        let buffer = editor.saveDocx();
        saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            `demo.docx`
        );
    };

    return (
        <div>
            <button onClick={handleClick}>Save Docx</button>
        </div>
    );
};

export default SaveFile;
