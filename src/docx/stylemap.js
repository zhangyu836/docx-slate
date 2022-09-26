import {css} from '@emotion/css';
import {FormatConv} from './formatConv';
import {FontConv} from './fontConv';

class StyleMap {
    constructor(styles, numberingMap) {
        this.styles = styles;
        this.numberingMap = numberingMap;
        this.nameToFormat = new Map();
        this.idToFormat = new Map();
        this.idToName = new Map();
        this.nameToCss = new Map();
        this.cssToName = new Map();
        this.nameToFormatElem = new Map();
        this.idToFont = new Map();
        this.linkToFont = new Map();
        this.nameToFont = new Map();
        this.nameToFontElem = new Map();
        this.loadStyles();
        this.mergeBase();
        this.generateCss();
        this.loadDefaults();
    }
    loadStyles(){
        for(let style of this.styles) {
            if (style.type===1){
                let {style_id, name} = style;
                let format = style.paragraph_format
                let formatConv = new FormatConv(format, style);
                this.idToFormat.set(style_id, formatConv);
                this.nameToFormat.set(name, formatConv);
                this.nameToFormatElem.set(name, format.element);
                this.idToName.set(style_id, name);
                let numbering = this.numberingMap.get(style_id);
                if (numbering){
                    formatConv.numbering = numbering;
                }
            } else if(style.type===2){
                let {font, style_id} = style;
                let fontConv = new FontConv(font, style);
                this.idToFont.set(style_id, fontConv);
                if(fontConv.link) {
                    this.linkToFont.set(fontConv.link, fontConv);
                    let name = this.idToName.get(fontConv.link);
                    this.nameToFont.set(name, fontConv);
                    this.nameToFontElem.set(name, font.element);
                }
            }
        }
    }
    mergeBase(){
        for(let format of this.idToFormat.values()) {
            if(format.baseId){
                let base = this.idToFormat.get(format.baseId);
                format.merge(base);
            }
        }
        for(let font of this.linkToFont.values()) {
            if(font.baseId){
                let base = this.idToFont.get(font.baseId);
                font.merge(base);
            }
        }
    }
    generateCss() {
        for(let [name, format] of this.nameToFormat.entries()) {
            let cssClass = css(format.styleObj);
            this.nameToCss.set(name, cssClass);
            if(!this.cssToName.has(cssClass))
                this.cssToName.set(cssClass, name);
        }
    }
    loadDefaults() {
        let format = this.styles.default_format();
        let formatObj = {margin: '0px'};
        if(format){
            let formatConv = FormatConv.fromFormat(format);
            Object.assign(formatObj, FormatConv.toStyleObj(formatConv));
            console.log('default format', formatObj);
        }
        this.defaultFormat = formatObj;

        let font = this.styles.default_font();
        let fontObj = {};
        if(font){
            let fontConv = FontConv.fromFont(font);
            Object.assign(fontObj, FontConv.toStyleObj(fontConv));
            console.log('default font', fontObj);
        }
        this.defaultFont = fontObj;
    }

    getCssClass(name) {
        return this.nameToCss.get(name);
    }
    getFont(name) {
        let font = this.nameToFont.get(name);
        if(font){
            return font.conv;
        }
        return null;
    }
    getDefaultFormat(curStyleMap) {
        if(curStyleMap) return curStyleMap.defaultFormat;
        return this.defaultFormat;
    }
    getDefaultFont(curStyleMap) {
        if(curStyleMap) return curStyleMap.defaultFont;
        return this.defaultFont;
    }
    getElementTypes(curStyleMap){
        let names = curStyleMap ? [...curStyleMap.nameToFormat.keys()] : [];
        for(let name of this.nameToFormat.keys()){
            if(!names.includes(name)){
                names.push(name);
            }
        }
        return names;
    }
    hasStyle(styleName){
        return this.nameToFormat.has(styleName);
    }
    styleAdded(styleName){
        return this.nameToFormat.set(styleName, true);
    }
    cloneStyle(styleName, curStyleMap) {
        let stylesElem = curStyleMap.styles.element;
        let formatElem = this.nameToFormatElem.get(styleName);
        let formatClone = formatElem.clone();
        stylesElem.append(formatClone);
        let fontElem = this.nameToFontElem.get(styleName);
        if(fontElem){
            let fontClone = fontElem.clone();
            stylesElem.append(fontClone);
        }
        curStyleMap.styleAdded(styleName);
    }
}

function getStyleMap(docx, numberingMap){
    return new StyleMap(docx.styles, numberingMap);
}

export {getStyleMap}
