import {IndentSpacingConv, AlignmentConv, BorderConv} from './converters';

let convertors = [IndentSpacingConv, AlignmentConv, BorderConv]
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
        for(let convertor of convertors){
            convertor.from(format, conv);
        }
        return conv;
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
