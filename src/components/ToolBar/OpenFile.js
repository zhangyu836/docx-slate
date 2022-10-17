import {useRef, useState} from 'react';
import { useSlate } from 'slate-react';
import {Transforms} from "slate";
import { RotatingLines } from 'react-loader-spinner';

const OpenFile = () => {
    const inputRef = useRef(null);
    let [loading, setLoading] = useState(false);
    let editor = useSlate();

    const handleClick = () => {
        // open file input box on click of other element
        inputRef.current.click();
    };
    const handleFileChange = event => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }
        setLoading(true);
        const reader = new FileReader();
        reader.readAsArrayBuffer(fileObj);
        reader.onload = function (){
            Transforms.deselect(editor);
            editor.loadDocx(this.result);
            setLoading(false);
        }
        console.log(fileObj.name);
        // reset file input
        event.target.value = null;
    };

    return (
        <div>
            <input
                style={{display: 'none'}}
                ref={inputRef}
                type="file"
                accept=".docx"
                onChange={handleFileChange}
            />
            <button onClick={handleClick}>Open Docx</button>
            <RotatingLines visible={loading} width={20}/>
        </div>
    );
};

export default OpenFile;
