import {useRef} from 'react';
import { useSlate } from 'slate-react';
import {Document} from '@zhangyu836/docxjs/dist/es5/index';

const OpenFile = () => {
    const inputRef = useRef(null);
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
        const reader = new FileReader();
        reader.readAsArrayBuffer(fileObj);
        reader.onload = function (){
            let docx;
            try{
                docx = new Document(Buffer.from(this.result));
            } catch (e){
                alert(e);
            }
            console.log('docx file', docx);
            editor.loadDocx(docx);
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
                onChange={handleFileChange}
            />
            <button onClick={handleClick}>Open Docx</button>
        </div>
    );
};

export default OpenFile;
