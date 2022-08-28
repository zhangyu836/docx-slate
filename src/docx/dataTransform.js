import {FontConv} from './fontConv'
import {FormatConv} from './formatConv';

function toEditorData(docx){
    let data = [];
    for(let paragraph of docx.paragraphs) {
        let style = paragraph.style;
        let parFmt = paragraph.paragraph_format;
        let element = FormatConv.fromFormat(parFmt);
        element.type = style.style_id;
        element.children = [];
        let parFontConv = parFmt.font ? FontConv.fromFont(parFmt.font) : null;
        for (let run of paragraph.runs){
            let leaf = FontConv.run2Leaf(run, parFontConv);
            element.children.push(leaf);
        }
        if (element.children.length===0)
            element.children.push({text:""});
        data.push(element);
    }
    return data;
}

function toDocx(docx, editor){
    let data = editor.children;
    for(let element of data){
        let paragraph = docx.add_paragraph();
        let styleName = editor.getStyleName(element.type);
        if(!styleName) {
            //console.log(element.type, 'style not found');
            styleName = "Normal";
        }
        paragraph.style = styleName;
        FormatConv.toFormat(paragraph.paragraph_format, element);
        for(let leaf of element.children){
            let run = paragraph.add_run();
            FontConv.runFromLeaf(run, leaf)
        }
    }
}

function saveDocx(editor){
    let docx = editor.docx;
    docx._body.clear_content();
    toDocx(docx, editor);
    return docx.save()
}

export {toEditorData, saveDocx};
