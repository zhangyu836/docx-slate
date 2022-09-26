import {FontConv} from './fontConv'
import {FormatConv} from './formatConv';

function toEditorData(docxContext){
    let {docx} = docxContext;
    let data = [];
    for(let paragraph of docx.paragraphs) {
        let style = paragraph.style;
        let parFmt = paragraph.paragraph_format;
        let element = FormatConv.fromFormat(parFmt);
        element.type = style ? style.name : 'Normal';
        element.children = [];
        let parFontConv = parFmt.font ? FontConv.fromFont(parFmt.font) : null;
        for (let run of paragraph.runs){
            let leaf = FontConv.run2Leaf(run, parFontConv);
            element.children.push(leaf);
        }
        if (element.children.length===0){
            let leaf = Object.assign({text:""}, parFontConv);
            element.children.push(leaf);
        }
        data.push(element);
    }
    return data;
}

function toDocx(docxContext, data){
    let {docx} = docxContext;
    for(let element of data){
        let paragraph = docx.add_paragraph();
        let styleName = docxContext.typeConv(element.type);
        docxContext.hasOrCloneStyle(styleName);
        paragraph.style = styleName;
        FormatConv.toFormat(paragraph.paragraph_format, element);
        for(let leaf of element.children){
            let run = paragraph.add_run();
            FontConv.runFromLeaf(run, leaf)
        }
    }
}
function saveDocx(docxContext, data){
    let {docx} = docxContext;
    docx._body.clear_content();
    toDocx(docxContext, data);
    return docx.save()
}

export {toEditorData, saveDocx};
