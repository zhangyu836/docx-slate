import {Document} from '@zhangyu836/docxjs/dist/es5/index';
import {docxContext} from "./docxContext";
import {toEditorData, saveDocx} from './dataTransform';

const withDocx = (editor) => {
    editor.getCssClass = (name) => {
        return docxContext.getCssClass(name);
    };
    editor.getFont = (name) => {
        return docxContext.getFont(name);
    };
    editor.getGlobalStyleObj = (className) => {
        return docxContext.getGlobalStyleObj(className);
    }
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
        docxContext.loadDocx(docx);
        let data = toEditorData(docxContext);
        console.log(data);
        if(data.length===0) {
            alert("no paragraphs found");
            return;
        }
        editor.children = data;
        editor.onChange();

    };
    editor.saveDocx = () => {
        return saveDocx(docxContext, editor.children);
    }
    editor.typeConv = (type) => {
        return docxContext.typeConv(type);
    }
    return editor;
};

export {withDocx};
