import {shared, enums} from 'docxyz';
import {
    AlignmentConv, RunBorderConv, PBordersConv,
    IndentSpacingConv, LineSpacingConv, ShdConv
} from './prAttrConvs';
import {ST_HexColorAuto} from 'docxyz/src/oxml/simpletypes';

class PrConv {
    static attrConvs = [];
    static convToPr(pr, conv){
        for(let attrConv of this.attrConvs) {
            attrConv.to(pr, conv);
        }
        return conv;
    }
    static prToConv(pr){
        let conv = {};
        for(let attrConv of this.attrConvs) {
            attrConv.from(pr, conv);
        }
        return conv;
    }
    static toStyleObj(conv, styleObj){
        if(!styleObj)
            styleObj = {};
        for(let attrConv of this.attrConvs) {
            attrConv.toStyleObj(conv, styleObj);
        }
        return styleObj;
    }
}

let boolAttrs = ['b', 'i', 'caps', 'smallCaps',//caps-->all_caps  small_caps
    'strike', 'outline'];//, 'rtl'
let boolAttrs2 = ['subscript', 'superscript']

class RPrConv extends PrConv {
    static getStylePr(style) {
        return style._element.rPr;
    }
    static convToPr(pr, conv) {
        for(let attr of boolAttrs){
            let bool = conv[attr];
            if(bool===true || bool===false) {
                pr._set_bool_val(attr, bool);
            }
        }
        for(let attr of boolAttrs2){
            let bool = conv[attr];
            if(bool===true || bool===false) {
                pr[attr] = bool;
            }
        }
        if(conv.size)
            pr.sz_val = new shared.Pt(conv.size);
        if(conv.color)
            pr.get_or_add_color().val = conv.color;
        if(conv.highlight) {
            pr.highlight_val = enums.WD_COLOR.from_xml(conv.highlight);
        }
        if(conv.underline)
            pr.u_val = conv.underline;
        if(conv.name) {
            pr.rFonts_ascii = conv.name;
            pr.rFonts_hAnsi = conv.name;
        }
        RunBorderConv.to(pr, conv);
    }
    static prToConv(pr) {
        let conv = {};
        for(let attr of boolAttrs){
            let v = pr._get_bool_val(attr);
            if(v!==null) {
                conv[attr] = v;
            }
        }
        for(let attr of boolAttrs2){
            let v = pr[attr];
            if(v!==null) {
                conv[attr] = v;
            }
        }
        let {sz_val, color, highlight_val, u_val, rFonts_ascii} = pr;
        if(sz_val)
            conv.size = sz_val.pt;
        if(color){
            if (color.val != ST_HexColorAuto.AUTO) {
                conv.color = color.val;
            }
        }
        if(highlight_val){
            //console.log(highlight_val, 'highlight')
            conv.highlight = enums.WD_COLOR.to_xml(highlight_val);
        }
        if(u_val)
            conv.underline = u_val;
        if(rFonts_ascii)
            conv.name = rFonts_ascii;
        RunBorderConv.from(pr, conv);
        return conv;
    }
    static toStyleObj(conv, obj){
        if(!obj)
            obj = {};
        if (conv.b) {
            obj.fontWeight = 'bold';
        }
        if (conv.i) {
            obj.fontStyle = 'italic';
        }
        if (conv.underline) {
            obj.textDecoration = 'underline';
        }
        //if (conv.rtl) {
        //    obj.direction = 'rtl';
        //}
        if(conv.caps) {
            obj.textTransform = 'uppercase';
        }
        if(conv.smallCaps) {
            obj.textTransform = 'uppercase';//'capitalize';
        }
        if (conv.outline) {
            obj.outline = 'auto';
        }
        if (conv.color) {
            obj.color = `#${conv.color}`;
        }
        if (conv.size) {
            obj.fontSize = `${conv.size}pt`;
        }
        if (conv.highlight) {
            obj.backgroundColor = conv.highlight;
        }
        if(conv.name) {
            obj.fontFamily = conv.name;
        }
        RunBorderConv.toStyleObj(conv, obj);
        return obj;
    }
}

class PPrConv extends PrConv {
    static attrConvs = [IndentSpacingConv, AlignmentConv, LineSpacingConv,
        ShdConv, PBordersConv];
    static getStylePr(style) {
        return style._element.pPr;
    }
}

export {PrConv, RPrConv, PPrConv};
