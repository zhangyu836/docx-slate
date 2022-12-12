import {css} from '@emotion/css';
import {FontConv, FormatConv} from './styleConv';
import {TableStyleConv} from './tblStyleConv';
import {FormatConvMap, FontConvMap, TableStyleConvMap} from "./styleConvMap";

class StyleMap {
    constructor(styles, numberingMap) {
        this.styles = styles;
        this.numberingMap = numberingMap;

        this.nameToCss = new Map();

        this.formatConvMap = new FormatConvMap(this);
        this.fontConvMap = new FontConvMap(this);
        this.tableStyleConvMap = new TableStyleConvMap(this);

        this.loadStyles();
        this.loadDefaults();
    }
    loadStyles(){
        for(let style of this.styles) {
            let type = style.type
            if (type===1){
                let formatConv = new FormatConv(style, this);
                this.formatConvMap.addConv(formatConv);
            } else if(type===2){
                let fontConv = new FontConv(style, this);
                this.fontConvMap.addConv(fontConv, this.formatConvMap);
            } else if(type===3) {
                let tableConv = new TableStyleConv(style, this);
                this.tableStyleConvMap.addConv(tableConv);
            }
        }
    }
    loadDefaults() {
        let format = this.styles.default_format();
        let conv = {
            ind_left: 0,
            ind_right: 0,
            spacing_before: 0,
            spacing_after: 0,
        }
        if(format){
            let formatConv = FormatConv.fromStyle(format);
            Object.assign(conv, formatConv);
            console.log('default format', conv);
        }
        this.defaultFormat = conv;
        let font = this.styles.default_font();
        let conv2 = {};
        if(font){
            let fontConv = FontConv.fromStyle(font);
            Object.assign(conv2, fontConv);
            console.log('default font', conv2);
        }
        this.defaultFont = conv2;
    }
    getCssClass(name) {
        if(!this.formatConvMap.getConv(name)) return null;
        let className = this.nameToCss.get(name);
        if (className) return className;
        let styleObj = this.getFormatNumbering(name);
        className = css(styleObj);
        this.nameToCss.set(name, className);
        return className;
    }
    getFont(name) {
        let font = this.fontConvMap.getConv(name);
        if(font) {
            return font.conv
        }
        return null;
    }
    getFontStyle(name) {
        return this.fontConvMap.getStyleObj(name);
    }
    getFormat(name) {
        let format = this.formatConvMap.getConv(name);
        if(format) {
            return format.conv
        }
        return null;
    }
    getFormatStyle(name) {
        return this.formatConvMap.getStyleObj(name);
    }
    getFormatNumbering(name) {
        let format = this.formatConvMap.getConv(name);
        if(format)
            return format.numberingObj;
    }
    getTableFormat(name) {
        let format = this.tableStyleConvMap.getConv(name);
        if(format) {
            return format.conv
        }
        return null;
    }
    getTableFormatStyle(name) {
        return this.tableStyleConvMap.getStyleObj(name);
    }
    getDefaultFormat(curStyleMap) {
        if(curStyleMap) return curStyleMap.defaultFormat;
        return this.defaultFormat;
    }
    getDefaultFont(curStyleMap) {
        if(curStyleMap) return curStyleMap.defaultFont;
        return this.defaultFont;
    }
    getParagraphStyles(curStyleMap){
        return this.formatConvMap.mergeStyleNames(curStyleMap);
    }
    idToFont(id) {
        return this.fontConvMap.idTo.get(id);
    }
    idToFontName(id) {
        return this.fontConvMap.idToName.get(id);
    }
    idToFormat(id) {
        return this.formatConvMap.idTo.get(id);
    }
    idToFormatName(id) {
        return this.formatConvMap.idToName.get(id);
    }
    hasStyle(styleName){
        return this.formatConvMap.nameTo.has(styleName);
    }
    styleAdded(styleName){
        return this.formatConvMap.nameTo.set(styleName, true);
    }
    cloneStyle(styleName, curStyleMap) {
        let stylesElem = curStyleMap.styles._element;
        let format = this.formatConvMap.getConv(styleName);
        let formatElem = format.formatElement;
        let formatClone = formatElem.clone();
        stylesElem.append(formatClone);
        let font = this.fontConvMap.getConv(styleName);
        let fontElem = font.fontElement;
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
