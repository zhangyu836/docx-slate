import hash from "object-hash";
import {cache} from "./cache";
import {serializeToString} from "docxyz/src/oxml/xmlhandler";
import {PPrConv, PrConv, RPrConv} from "./prConv";

class StyleConv {
    static prConv = PrConv;
    constructor(style, styleMap) {
        this.style = style;
        this.styleMap = styleMap;
    }
    get baseId() {
        if (this.style.base_style)
            return this.style.base_style.style_id;
    }
    get conv() {
        if(!this._conv)
            this._conv = this.constructor.fromStyle(this.style);
        return this._conv;
    }
    get font() {
        return this.style.font;
    }
    get format() {
        return this.style.paragraph_format;
    }
    get name() {
        return this.style.name;
    }
    get styleId() {
        return this.style.style_id;
    }
    get styleObj() {
        if(!this._styleObj)
            this._styleObj = this.constructor.toStyleObj(this.conv);
        return this._styleObj;
    }
    static toStyleObj(conv) {
        return this.prConv.toStyleObj(conv)
    }
    static fromStyle(style) {
        let pr = this.prConv.getStylePr(style);
        if(pr){
            let h = hash(serializeToString(pr.xmlElement));
            let c = cache.get(h);
            if (c) {
                return {...c};
            }
            let conv = this.prConv.prToConv(pr);
            cache.set(h, conv);
            return conv;
        } else {
            return {};
        }
    }
}

class FormatConv extends StyleConv {
    static prConv = PPrConv;
    constructor(style, styleMap) {
        super(style, styleMap);
        this.numberingMap = styleMap.numberingMap;
    }
    get formatElement() {
        return this.format._element;
    }
    get conv() {
        if(!this._conv) {
            let base = this.styleMap.idToFormat(this.baseId);
            let conv = this.constructor.fromStyle(this.style);
            //let defaultFormat = this.styleMap.defaultFormat;
            if(base)
                this._conv = {...base.conv, ...conv};//...defaultFormat,
            else
                this._conv = conv;//{...defaultFormat, ...conv};
        }
        return this._conv;
    }
    get numberingObj() {
        let numbering = this.numberingMap.get(this.styleId);
        return numbering ? numbering.styleObj : null;
    }
    static toStyle(paragraph, conv) {
        let pr = paragraph._element.get_or_add_pPr();
        this.prConv.convToPr(pr, conv);
    }
}


class FontConv extends StyleConv {
    static prConv = RPrConv;
    get conv() {
        if(!this._conv) {
            let base = this.styleMap.idToFont(this.baseId);
            let conv = this.constructor.fromStyle(this.style);
            //let defaultFont = this.styleMap.defaultFont;
            if(base)
                this._conv = {...base.conv, ...conv};//...defaultFont
            else
                this._conv = conv;//{...defaultFont, ...conv};
        }
        return this._conv;
    }
    get linkId() {
        let elem = this.style._element;
        let link = elem.find('w:link');
        if(link){
            return link.getAttribute("w:val");
        }
    }
    get fontElement() {
        return this.font._element;
    }
    static runToText(run, parFontConv){
        let textConv = this.fromStyle(run);
        if(parFontConv)
            textConv = {...parFontConv, ...textConv};
        textConv.text = run.text;
        return textConv;
    }
    static runFromText(run, textConv){
        run.text = textConv.text;
        let pr = run._element.get_or_add_rPr();
        this.prConv.convToPr(pr, textConv);
    }
}

export {FontConv, FormatConv, StyleConv}
