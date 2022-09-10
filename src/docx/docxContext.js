import React from 'react';
import {Document} from '@zhangyu836/docxjs/dist/es5/index';
import {getStyleMap} from './stylemap';
import {loadNumbering} from './numbering';

class DocxStore {
    constructor() {
        this.docx = null;
        this.numberingMap = null;
        this.styleMap = null;
        this.loaded = false;
    }
    loadDocx(docx) {
        this.docx = docx;
        this.numberingMap = loadNumbering(docx);
        this.styleMap = getStyleMap(docx, this.numberingMap);
        this.loaded = true;
    }
    loadDefaultDocx() {
        let docx = new Document();
        this.loadDocx(docx);
    }
    getCssClass(name) {
        if(!this.loaded) return ;
        return this.styleMap.getCssClass(name);
    }
    getFont(name) {
        if(!this.loaded) return ;
        return this.styleMap.getFont(name);
    }
}

class DocxContext {
    constructor() {
        this.dftStore = new DocxStore();
        this.dftStore.loadDefaultDocx();
        this.curStore = new DocxStore();
    }
    get docx() {
        return this.curStore.docx || this.dftStore.docx;
    }
    get elementTypes(){
        if(this._elementTypes) return this._elementTypes;
        let dftStyleMap = this.dftStore.styleMap;
        let curStyleMap = this.curStore.styleMap;
        this._elementTypes = dftStyleMap.getElementTypes(curStyleMap);
        return this._elementTypes;
    }
    getCssClass(name) {
        return this.curStore.getCssClass(name) || this.dftStore.getCssClass(name);
    }
    getFont(name) {
        let parFont = this.curStore.getFont(name) || this.dftStore.getFont(name);
        return parFont || {};
    }
    getGlobalStyleObj(className){
        if(this._globalStyleObj) return this._globalStyleObj;
        let dftNumbering = this.dftStore.numberingMap;
        let curNumbering = this.curStore.numberingMap;
        let dftStyleMap = this.dftStore.styleMap;
        let curStyleMap = this.curStore.styleMap;
        let counterReset = dftNumbering.getCounterReset(curNumbering);
        let dftFormat = dftStyleMap.getDefaultFormat(curStyleMap);
        let dftFont = dftStyleMap.getDefaultFont(curStyleMap);
        let selector = `.${className}`;
        this._globalStyleObj = {
            [selector]: counterReset,
            'p': dftFormat,
            'p span[data-slate-node]': dftFont
        };
        return this._globalStyleObj;
    }
    hasOrCloneStyle(styleName){
        if(!this.curStore.loaded) return;
        let curStyleMap = this.curStore.styleMap;
        if(curStyleMap.hasStyle(styleName)) return;
        let dftStyleMap = this.dftStore.styleMap;
        dftStyleMap.cloneStyle(styleName, curStyleMap);
    }
    loadDocx(docx) {
        this.curStore.loadDocx(docx);
        this._elementTypes = null;
        this._globalStyleObj = null;
    }
    typeConv(type) {
        if (this.elementTypes.includes(type)) return type;
        switch (type) {
            case "paragraph":
                return "Normal";
            case "block-quote":
                return "Intense Quote";
            case "heading-one":
                return "Heading 1";
            case "heading-two":
                return "Heading 2";
            case "bulleted-list":
                return "List Bullet";
            case "numbered-list":
                return "List Number";
        }
        return "Normal";
    }
}

export const docxContext =  new DocxContext();
//const EditorDocxContext = React.createContext(docxContext);
//export function useDocx() {
//    return React.useContext(EditorDocxContext);
//}
