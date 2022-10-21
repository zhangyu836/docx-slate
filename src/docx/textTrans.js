import {text} from "docxyz";
import {elementTypes} from "./types";
import {FontConv} from "./fontConv";
import {FormatConv} from "./formatConv";

class RunTrans {
    static from(run, options) {
        let leaf = FontConv.run2Leaf(run, options.parFontConv);
        // save time
        let styleId = run._element.style;
        if(styleId) {
            let {docxContext} = options;
            leaf.style = docxContext.styleMap.idToFontName.get(styleId);
        }
        return leaf;
    }
    static to(leaf, parent, options) {
        let run = parent.add_run();
        FontConv.runFromLeaf(run, leaf)
        if(leaf.style) {
            run.style = leaf.style;
        }
    }
}

class HyperlinkTrans {
    static from(hyperlink, options) {
        let children = [];
        for(let run of hyperlink.runs){
            let leaf = RunTrans.from(run, options);
            children.push(leaf);
        }
        return {
            type: elementTypes.HYPERLINK,
            url: hyperlink.target_ref,
            children
        };
    }
    static to(element, paragraph, options) {
        let hyperlink = paragraph.add_hyperlink(element.url);
        for(let child of element.children) {
            RunTrans.to(child, hyperlink, options);
        }
    }
}

class ParagraphTrans {
    static  from(paragraph, options) {
        let children = [];
        let parFmt = paragraph.paragraph_format;
        let element = FormatConv.fromFormat(parFmt);
        // save time
        let styleId = paragraph._p.style;
        if(!styleId) {
            element.style = 'Normal';
        } else {
            let {docxContext} = options;
            element.style = docxContext.styleMap.idToName.get(styleId);
        }
        element.type = elementTypes.PARAGRAPH;
        let parFontConv = parFmt.font ? FontConv.fromFont(parFmt.font) : null;
        options.parFontConv = parFontConv;
        for(let child of paragraph.content) {
            if(child instanceof text.Run) {
                let leaf = RunTrans.from(child, options);
                children.push(leaf);
            } else {
                let hyperlink = HyperlinkTrans.from(child, options);
                children.push(hyperlink);
            }
        }
        if (children.length===0){
            let leaf = Object.assign({text:""}, parFontConv);
            children.push(leaf);
        }
        element.children = children;
        return element;
    }
    static to(element, container, options) {
        let {docxContext} = options;
        let paragraph = container.add_paragraph();
        let styleName = element.style ? element.style : 'Normal';
        docxContext.hasOrCloneStyle(styleName);
        paragraph.style = styleName;
        FormatConv.toFormat(paragraph.paragraph_format, element);
        for(let child of element.children){
            if(child.type===elementTypes.HYPERLINK) {
                HyperlinkTrans.to(child, paragraph, options);
            } else {
                RunTrans.to(child, paragraph, options);
            }
        }
        return container;
    }
}

export {ParagraphTrans}
