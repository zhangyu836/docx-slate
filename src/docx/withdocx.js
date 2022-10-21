import {Document} from 'docxyz';
import {docxContext} from "./docxContext";
import {toEditorData, saveDocx} from './trans';
import { v4 as uuid } from 'uuid';

const withDocx = (editor) => {
    editor.getCssClass = (name) => {
        return docxContext.getCssClass(name);
    };
    editor.getFont = (name) => {
        return docxContext.getFont(name);
    };
    editor.getFormat = (name) => {
        return docxContext.getFormat(name);
    };
    editor.getGlobalStyleObj = (className) => {
        return docxContext.getGlobalStyleObj(className);
    };
    editor.getElementTypes = () => {
        return docxContext.elementTypes;
    }
    editor.loadDocx = (buffer) => {
        let docx;
        try{
            docx = new Document(Buffer.from(buffer));
        } catch (e){
            alert(e);
            return;
        }
        console.log('docx file', docx);
        console.time('load')
        docxContext.loadDocx(docx);
        console.timeEnd('load');
        console.time('transform')
        let data = toEditorData(docxContext);
        console.timeEnd('transform');
        console.log(data);
        editor.children = data;
        editor.onChange();

    };
    editor.saveDocx = () => {
        return saveDocx(docxContext, editor.children);
    }
    return editor;
};

export {withDocx};
