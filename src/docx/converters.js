import {Pt} from '@zhangyu836/docxjs/dist/es5/index';

let indentSpacingPrs = ['first_line_indent', 'left_indent', 'right_indent',
    'space_before', 'space_after'];
class IndentSpacingConv {
    static from(format, conv) {
        for(let pr of indentSpacingPrs) {
            let v = format[pr];
            if (v){
                conv[pr] = v.pt;
            }
        }
    }
    static to(format, conv) {
        for(let pr of indentSpacingPrs) {
            if (conv[pr])
                format[pr] = new Pt(conv[pr]);
        }
    }
    static indent(conv, styleObj){
        if (conv.first_line_indent)
            styleObj.textIndent = `${conv.first_line_indent}pt`;
        if (conv.left_indent)
            styleObj.marginLeft = `${conv.left_indent}pt`;
        if (conv.right_indent)
            styleObj.marginRight = `${conv.right_indent}pt`;
    }
    static spacing(conv, styleObj) {
        if (conv.space_before)
            styleObj.marginTop = `${conv.space_before}pt`;
        if (conv.space_after)
            styleObj.marginBottom = `${conv.space_after}pt`;
    }
    static toStyleObj(conv, styleObj){
        this.indent(conv, styleObj);
        this.spacing(conv, styleObj);
    }
}
class LineSpacingConv {
    static from(format, conv) {
        let pr = 'line_spacing';
        let v = format['line_spacing'];
        if (v){
            if(typeof v === 'number'){
                conv[pr] = v;
                conv['line_spacing_unit'] = '';
            } else {
                conv[pr] = v.pt;
                conv['line_spacing_unit'] = 'pt';
            }
        }
    }
    static to(format, conv) {
        let pr = 'line_spacing';
        if (conv[pr])
            if(conv['line_spacing_unit'])
                format[pr] = new Pt(conv[pr]);
            else
                format[pr] = conv[pr];
    }
    static toStyleObj(conv, styleObj){
        if(conv.line_spacing){
            styleObj.lineHeight = `${conv.line_spacing}${conv.line_spacing_unit}`;
        }
    }
}
class ShdConv {
    static from(format, conv) {
        let pPr = format.element.pPr;
        let shd = pPr ? pPr.shd : null;
        if(shd){
            conv.shd = shd.getAttribute('w:fill');
        }
    }
    static to(format, conv){}
    static toStyleObj(conv, styleObj){
        if(conv.shd){
            styleObj.backgroundColor = `#${conv.shd}`;
        }
    }
}
class AlignmentConv {
    static from(format, conv) {
        if(format.alignment){
            let alignment = "left";
            switch (format.alignment){
                case 0:
                    alignment = "left";
                    break;
                case 1:
                    alignment = "center";
                    break;
                case 2:
                    alignment = "right";
                    break;
                case 3:
                    alignment = "justify";
                    break;
            }
            conv.alignment = alignment;
        }
    }
    static to(format, conv){
        if(conv.alignment){
            let alignment = 0;
            switch (conv.alignment){
                case "left":
                    alignment = 0;
                    break;
                case "center":
                    alignment = 1;
                    break;
                case "right":
                    alignment = 2;
                    break;
                case "justify":
                    alignment = 3;
                    break;
            }
            format.alignment = alignment;
        }
    }
    static toStyleObj(conv, styleObj){
        if(conv.alignment)
            styleObj.textAlign = conv.alignment;
    }
}
class TextAlignmentConv{
    static from(format, conv){
        let pprElem = format.element;
        let elem = pprElem.textAlignment;
        if(elem) {
            let val = elem.val;
            let alignment = val;
            switch (val) {
                case "baseline":
                case "top":
                case "bottom":
                    break;
                case "auto":
                    alignment = "baseline";
                    break;
                case "center":
                    alignment = "middle";
                    break;
            }
            conv.textAlignment = alignment;
        }
    }
    static to(format, conv){
    }
    static toStyleObj(conv, styleObj){
        styleObj.verticalAlign = conv.textAlignment;
    }
}

class LineConv{
    static from(val){
        switch (val) {
            case "dash":
            case "dashDotDotHeavy":
            case "dashDotHeavy":
            case "dashedHeavy":
            case "dashLong":
            case "dashLongHeavy":
            case "dotDash":
            case "dotDotDash":
                return "dashed";
            case "dotted":
            case "dottedHeavy":
                return "dotted";
            case "double":
                return "double";
            case "single":
            case "thick":
            case "words":
                return "solid";
            case "none":
                return "none";
        }
        return "solid";
    }
    static to(val){
        switch (val) {
            case "dashed":
                return "dash";
            case "dotted":
                return "dotted";
            case "double":
                return "double";
            case "solid":
                return "single";
            case "none":
                return "none";
        }
        return "single";
    }
}
let sides = ['left', 'right', 'top', 'bottom'];
class BorderConv {
    static from(format, conv) {
        let pprElem = format.element.pPr;
        if(!pprElem) return;
        let borders = pprElem.pBdr;
        if(!borders) return;
        for(let side of sides) {
            let border = borders[side];
            if(!border) continue;
            let val = border.val;
            if (val === "nil")
                return;
            conv[`border_${side}_style`] = LineConv.from(val);
            if(border.sz) {
                conv[`border_${side}_width`] = border.sz.pt * 0.25;
            }
            if( border.color) {
                conv[`border_${side}_color`] =
                    border.color === "auto" ? '000000' : `${border.color}`;
            }
            if( border.space) {
                conv[`padding_${side}`] = border.space;
            }

        }
    }
    static to(format, conv) {
    }
    static side2styleObj(conv, styleObj, side){
        let Side = side.slice(0,1).toUpperCase() + side.slice(1);
        let style = conv[`border_${side}_style`];
        if (!style) return;
        styleObj[`border${Side}Style`] = style;
        let width = conv[`border_${side}_width`];
        if(width){
            styleObj[`border${Side}Width`] = `${width}pt`;
        }
        let color = conv[`border_${side}_color`];
        if(color){
            styleObj[`border${Side}Color`] = `#${color}`;
        }
        let padding = conv[`padding_${side}`];
        if( padding) {
            styleObj[`padding${Side}`] = `${padding}pt`;
        }
    }
    static toStyleObj(conv, styleObj){
        for(let side of sides){
            this.side2styleObj(conv, styleObj, side);
        }
    }
}

class FontBorderConv {
    static from(font, conv) {
        let rprElem = font.element.rPr;
        if(!rprElem) return;
        let border = rprElem.bdr;
        if(!border) return;
        let val = border.val;
        if (val === "nil")
            return;
        conv[`border_style`] = LineConv.from(val);
        if(border.sz) {
            conv[`border_width`] = border.sz.pt * 0.25;
        }
        if( border.color) {
            conv[`border_color`] =
                border.color === "auto" ? '000000' : `${border.color}`;
        }
        if( border.space) {
            conv[`padding`] = border.space;
        }
    }
    static to(format, conv) {
    }
    static toStyleObj(conv, styleObj){
        let style = conv[`border_style`];
        if (!style) return;
        styleObj[`borderStyle`] = style;
        let width = conv[`border_width`];
        if(width){
            styleObj[`borderWidth`] = `${width}pt`;
        }
        let color = conv[`border_color`];
        if(color){
            styleObj[`borderColor`] = `#${color}`;
        }
        let padding = conv[`padding`];
        if( padding) {
            styleObj[`padding`] = `${padding}pt`;
        }
    }
}

export {IndentSpacingConv, LineSpacingConv, AlignmentConv, BorderConv, ShdConv, FontBorderConv }
