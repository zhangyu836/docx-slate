import {css}  from '@emotion/css';
import {FormatConv} from './formatConv';
import {FontConv} from './fontConv';
import {loadNumbering} from "./numbering";

class StyleMap {
    constructor() {
        this.id2format = new Map();
        this.id2font = new Map();
        this.link2font = new Map();
        this.id2name = new Map();
        this.id2css = new Map();
        this.css2id = new Map();
    }
    load(styles, numberingMap){
        this.numberingMap = numberingMap;
        for(let style of styles) {
            if (style.type===1){
                let formatConv = new FormatConv(style.paragraph_format, style);
                this.id2format.set(style.style_id, formatConv);
                this.id2name.set(style.style_id, style.name);
                let numbering = numberingMap.get(style.style_id);
                if (numbering){
                    formatConv.numbering = numbering;
                }
            } else if(style.type===2){
                let font = new FontConv(style.font, style);
                this.id2font.set(style.style_id, font);
                if(font.link) {
                    this.link2font.set(font.link, font);
                } //else console.log('no link', font);
            }
        }
        this.merge();
        this.getCss();
    }
    merge(){
        for(let format of this.id2format.values()) {
            if(format.baseId){
                let base = this.id2format.get(format.baseId);
                format.merge(base);
            }
        }
        for(let font of this.link2font.values()) {
            if(font.baseId){
                let base = this.id2font.get(font.baseId);
                font.merge(base);
            }
        }
    }
    getCss() {
        for(let [styleId, format] of this.id2format.entries()) {
            let styleObj = format.styleObj;
            let cssClass = css(styleObj);
            this.id2css.set(styleId, cssClass);
            if(!this.css2id.has(cssClass))
                this.css2id.set(cssClass, styleId);
        }
    }
    global(editorClass){
        let selector = `.${editorClass}`;
        return {
            [selector]: this.numberingMap.globalCounterReset
        };
    }
    getCssClass(id) {
        return this.id2css.get(id);
    }
    getFont(id) {
        let font = this.link2font.get(id);
        if(font){
            return font.conv;
        }
        return null;
    }
    get elementTypes(){
        let options = [];
        let types = [];
        for(let id of this.css2id.values()){
            options.push({value:id, text:this.id2name.get(id)});
            types.push(id);
        }
        return {options, types};
    }
}

function getStyleMap(docx){
    let numberingMap = loadNumbering(docx);
    let styleMap = new StyleMap();
    styleMap.load(docx.styles, numberingMap);
    return styleMap;
}

export {getStyleMap, StyleMap}
