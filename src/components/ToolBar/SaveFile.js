import { useSlate } from 'slate-react';
import saveAs from "file-saver";

const SaveFile = () => {
    let editor = useSlate();
    const handleClick = () => {
        let buffer = editor.saveDocx();
        let blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs( blob ,  `demo.docx` );
    };
    return (
        <div>
            <button onClick={handleClick}>Save Docx</button>
        </div>
    );
};

export default SaveFile;
