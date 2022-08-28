import {Document} from '@zhangyu836/docxjs/dist/es5/index';
import {getStyleMap} from './/stylemap';
import {toEditorData, saveDocx} from './dataTransform';

const withDocx = (editor) => {
    editor.getCssClass = (id) => {
        return editor.styleMap.getCssClass(id);
    };
    editor.getStyleName = (id) => {
        return editor.styleMap.id2name.get(id);
    };
    editor.getFont = (id) => {
        let parFont = editor.styleMap.getFont(id);
        return parFont || {};
    };
    editor.loadDefaultDocx = () => {
        let docx = new Document();
        editor.styleMap = getStyleMap(docx);
        editor.elementTypes = editor.styleMap.elementTypes;
        editor.docx = docx;
    };
    editor.loadDocx = (docx) => {
        editor.styleMap = getStyleMap(docx);
        editor.elementTypes = editor.styleMap.elementTypes;
        editor.docx = docx;
        let data = toEditorData(docx, editor.styleMap);
        console.log(data);
        if(data.length==0) {
            alert("no paragraphs found");
            return;
        }
        editor.children = data;
        editor.onChange();
    };
    editor.saveDocx = () => {
        return saveDocx(editor);
    }
    editor.loadDefaultDocx();
    return editor;
};

export {withDocx};
