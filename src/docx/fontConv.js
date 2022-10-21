import {shared, enums} from 'docxyz';
import {FontBorderConv} from './converters';
import hash from 'object-hash';
import {cache} from "./cache";
import {serializeToString} from 'docxyz/src/oxml/xmlhandler'

let boolPrs = ['bold', 'italic', 'all_caps', 'small_caps',
    'strike', 'subscript', 'superscript', 'outline'];//, 'rtl'

class FontConv {
    constructor(font, style) {
        this.conv = FontConv.fromFont(font);
        this.styleId = style.style_id;
        this.name = style.name;
        if (style.base_style)
            this.baseId = style.base_style.style_id;
        let elem = style.element;
        let link = elem.find('w:link');
        if(link){
            this.link = link.getAttribute("w:val");
        }
    }
    static fromFont(font) {
        let conv = {};
        let rPr = font._element.rPr;
        if(!rPr){
            return conv;
        } else {
            let h = hash(serializeToString(rPr.xmlElement));
            let c = cache.get(h);
            if (c) {
                return Object.assign({}, c);
            }
            for(let pr of boolPrs){
                if(font[pr]!==null) {
                    conv[pr] = font[pr];
                }
            }
            if(font.size)
                conv.size = font.size.pt;
            if(font.color.rgb)
                conv.color = font.color.rgb.toString();
            if(font.highlight_color){
                conv.highlight = enums.WD_COLOR.to_xml(font.highlight_color);
            }
            if(font.underline)
                conv.underline = font.underline;
            if(font.name)
                conv.name = font.name;
            FontBorderConv.from(font, conv);
            cache.set(h, conv);
            return conv;
        }
    }
    merge(base){
        if(Object.keys(base.conv).length===0) return;
        this.conv = Object.assign({}, base.conv, this.conv);
    }
    static run2Leaf(run, parFontConv){
        let font = run.font;
        let leafConv = FontConv.fromFont(font);
        if(parFontConv)
            //console.log(parFontConv, leafConv);
            leafConv = Object.assign({}, parFontConv, leafConv);
        leafConv.text = run.text;
        return leafConv;
    }
    static runFromLeaf(run, leaf){
        run.text = leaf.text;
        let font = run.font;
        for(let pr of boolPrs){
            if(leaf[pr]===true || leaf[pr]===false) {
                font[pr] = leaf[pr];
            }
        }
        if(leaf.size)
            font.size = new shared.Pt(leaf.size);
        if(leaf.color)
            font.color.rgb = shared.RGBColor.from_string(leaf.color);
        if(leaf.highlight) {
            font.highlight_color = enums.WD_COLOR.from_xml(leaf.highlight);
        }
        if(leaf.underline)
            font.underline = leaf.underline;
        if(leaf.name)
            font.name = leaf.name;
    }
    static toStyleObj(conv){
        let obj = {};
        if (conv.bold) {
            obj.fontWeight = 'bold';
        }
        if (conv.italic) {
            obj.fontStyle = 'italic';
        }
        if (conv.underline) {
            obj.textDecoration = 'underline';
        }
        //if (conv.rtl) {
        //    obj.direction = 'rtl';
        //}
        if(conv.all_caps) {
            obj.textTransform = 'uppercase';
        }
        if(conv.small_caps) {
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
        FontBorderConv.toStyleObj(conv, obj);
        return obj;
    }
}

export {FontConv};
