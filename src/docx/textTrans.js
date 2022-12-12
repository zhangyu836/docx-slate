import {text} from "docxyz";
import {elementTypes} from "./types";
import {FontConv, FormatConv} from "./style/styleConv";

class RunTrans {
    static from(run, options) {
        let textConv = FontConv.runToText(run, options.parFontConv);
        let styleId = run._element.style;
        if(styleId) {
            let {docxContext} = options;
            textConv.style = docxContext.styleMap.idToFontName(styleId);
        }
        return textConv;
    }
    static to(textConv, parent, options) {
        let run = parent.add_run();
        FontConv.runFromText(run, textConv)
        if(textConv.style) {
            run.style = textConv.style;
        }
    }
}

class HyperlinkTrans {
    static from(hyperlink, options) {
        let children = [];
        for(let run of hyperlink.runs){
            let textConv = RunTrans.from(run, options);
            children.push(textConv);
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
        let parConv = FormatConv.fromStyle(parFmt);
        // save time
        let styleId = paragraph._element.style;
        if(!styleId) {
            parConv.style = 'Normal';
        } else {
            let {docxContext} = options;
            parConv.style = docxContext.styleMap.idToFormatName(styleId);
        }
        parConv.type = elementTypes.PARAGRAPH;
        let parFont = parFmt.font;
        let parFontConv = parFont ? FontConv.fromStyle(parFont) : null;
        options.parFontConv = parFontConv;
        for(let child of paragraph.content) {
            if(child instanceof text.Run) {
                let textConv = RunTrans.from(child, options);
                children.push(textConv);
            } else {
                let hyperlink = HyperlinkTrans.from(child, options);
                children.push(hyperlink);
            }
        }
        if (children.length===0){
            let textConv = {text:"", ...parFontConv};
            children.push(textConv);
        }
        parConv.children = children;
        return parConv;
    }
    static to(parConv, container, options) {
        let {docxContext} = options;
        let paragraph = container.add_paragraph();
        let styleName = parConv.style ? parConv.style : 'Normal';
        docxContext.hasOrCloneStyle(styleName);
        paragraph.style = styleName;
        FormatConv.toStyle(paragraph, parConv);
        for(let child of parConv.children){
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
