import React from 'react';
import {Document} from 'docxyz';
import {getStyleMap} from './stylemap';
import {loadNumbering} from './numbering';
import {getSectionMap} from './section';

class DocxStore {
    constructor() {
        this.docx = null;
        this.numberingMap = null;
        this.styleMap = null;
        this.sectionMap = null;
        this.loaded = false;
    }
    loadDocx(docx) {
        this.docx = docx;
        this.numberingMap = loadNumbering(docx);
        this.styleMap = getStyleMap(docx, this.numberingMap);
        this.sectionMap = getSectionMap(docx);
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
    getFormat(name) {
        if(!this.loaded) return ;
        return this.styleMap.getFormat(name);
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
    get sectionMap(){
        return this.curStore.sectionMap || this.dftStore.sectionMap;
    }
    get styleMap() {
        return this.curStore.styleMap || this.dftStore.styleMap;
    }
    getCssClass(name) {
        return this.curStore.getCssClass(name) || this.dftStore.getCssClass(name);
    }
    getFont(name) {
        let parFont = this.curStore.getFont(name) || this.dftStore.getFont(name);
        return parFont || {};
    }
    getFormat(name) {
        let parFormat = this.curStore.getFormat(name) || this.dftStore.getFormat(name);
        return parFormat || {};
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
            'p[data-slate-node=element]': dftFormat,
            'span[data-slate-node=text]': dftFont
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
}

export const docxContext =  new DocxContext();
//const EditorDocxContext = React.createContext(docxContext);
//export function useDocx() {
//    return React.useContext(EditorDocxContext);
//}
