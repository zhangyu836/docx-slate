import {IndentSpacingConv, LineSpacingConv, AlignmentConv,
    BorderConv, ShdConv} from './converters';
import hash from "object-hash";
import {cache} from "./cache";
import {serializeToString} from "docxyz/src/oxml/xmlhandler";


let convertors = [IndentSpacingConv, LineSpacingConv, AlignmentConv,
    BorderConv, ShdConv]
class FormatConv {
    constructor(format, style) {
        this.styleId = style.style_id;
        this.name = style.name;
        if (style.base_style)
            this.baseId = style.base_style.style_id;
        this.conv = FormatConv.fromFormat(format);
    }
    static toFormat(format, conv){
        for(let convertor of convertors){
            convertor.to(format, conv);
        }
    }
    static fromFormat(format){
        let conv = {};
        let pPr = format._element.pPr;
        if(!pPr){
            return conv;
        } else {
            let h = hash(serializeToString(pPr.xmlElement));
            let c = cache.get(h);
            if (c) {
                return Object.assign({}, c);
            }
            for (let convertor of convertors) {
                convertor.from(format, conv);
            }
            cache.set(h, conv);
            return conv;
        }
    }
    static toStyleObj(conv){
        let obj = {};
        for(let convertor of convertors){
            convertor.toStyleObj(conv, obj);
        }
        return obj;
    }
    merge(base){
        if(Object.keys(base.conv).length===0) return;
        this.conv = Object.assign({}, base.conv, this.conv);
    }
    get styleObj(){
        let styleObj = FormatConv.toStyleObj(this.conv);
        if(this.numbering){
            styleObj = Object.assign(styleObj, this.numbering.styleObj);
        }
        return styleObj
    }
}

export {FormatConv}
