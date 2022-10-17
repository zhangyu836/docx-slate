import {text, table, enums} from 'docxyz';
import {elementTypes} from "./types";
import {ParagraphTrans} from "./textTrans";
import {TableTrans} from "./tableTrans";

function isColBr(paragraph) {
    let type = "column";
    let brs = paragraph._element.xpath(`.//w:br[@w:type="${type}"]`);
    if(brs.length>0) {
        for(let br of brs){
            paragraph._element.remove(br.getparent());
        }
        return true;
    }
}
function isSection(paragraph) {
    let pPr = paragraph._p.pPr;
    if(pPr && pPr.sectPr)
        return true;
}
function addColBr(container) {
    let paragraph = container.add_paragraph();
    paragraph.add_run().add_break(enums.WD_BREAK.COLUMN);
}
function addSection(container, sectPr) {
    let paragraph = container.add_paragraph();
    let _paragraph = paragraph._p;
    _paragraph.set_sectPr(sectPr);
}
class DocxTrans {
    static from(docx, options) {
        let {docxContext} = options;
        let {sectionMap} = docxContext;
        let columnChildren = [];
        let sectionIndex = 0;
        let slateSection = sectionMap.getSectionElement(sectionIndex);
        let slateSections = [];
        for(let child of docx.content) {
            if(child instanceof text.Paragraph) {
                if(isColBr(child)) {
                    let column = slateSection.children[slateSection.colIndex];
                    column.children = columnChildren;
                    columnChildren = [];
                    slateSection.colIndex += 1;
                    if(child.text) {
                        let paragraph = ParagraphTrans.from(child, options);
                        columnChildren.push(paragraph);
                    }
                }
                else if(isSection(child)) {
                    let column = slateSection.children[slateSection.colIndex];
                    column.children = columnChildren;
                    columnChildren = [];
                    slateSections.push(slateSection);
                    sectionIndex += 1;
                    slateSection = sectionMap.getSectionElement(sectionIndex);
                } else {
                    let paragraph = ParagraphTrans.from(child, options);
                    columnChildren.push(paragraph);
                }
            } else if(child instanceof table.Table)  {
                let table = TableTrans.from(child, options);
                columnChildren.push(table);
            }
        }
        let column = slateSection.children[slateSection.colIndex];
        column.children = columnChildren;
        slateSections.push(slateSection);
        return slateSections;
    }
    static to(data, docx, options) {
        let {docxContext} = options;
        let {sectionMap} = docxContext;
        let container = docx;
        for(let [sectionIndex, section] of data.entries()) {
            if(section.type===elementTypes.SECTION){
                for(let [columnIndex,column] of section.children.entries()) {
                    for(let child of column.children) {
                        if(child.type===elementTypes.TABLE){
                            TableTrans.to(child, container, options);
                        }
                        else if(child.type===elementTypes.PARAGRAPH){
                            ParagraphTrans.to(child, container, options);
                        }
                    }
                    if(columnIndex < section.children.length - 1) {
                        addColBr(container);
                    }
                }
            }
            if(sectionIndex < data.length - 1){
                let sectPr = sectionMap.getSectPr(section.key);
                addSection(container, sectPr);
            } else {
            }
        }
    }
}

function toEditorData(docxContext){
    let {docx} = docxContext;
    let options = {docxContext};
    let sections = DocxTrans.from(docx, options);
    return sections;
}

function toDocx(docxContext, data){
    let {docx} = docxContext;
    let options = {docxContext}
    DocxTrans.to(data, docx, options);
}
function saveDocx(docxContext, data){
    let {docx} = docxContext;
    docx._body.clear_content();
    toDocx(docxContext, data);
    return docx.save()
}

export {toEditorData, saveDocx};

