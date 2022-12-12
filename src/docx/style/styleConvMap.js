import {FontConv, FormatConv} from "./styleConv";
import {TableStyleConv} from "./tblStyleConv";


class StyleConvMap {
    constructor(styleMap) {
        this.styleMap = styleMap
        this.idTo = new Map()
        this.nameTo = new Map()
        this.idToName = new Map()
    }
    //newConv(style) {
    //    throw new Error('to be overridden')
    //}
    addStyle(style) {
        let conv = this.newConv(style)
        this.addConv(conv)
    }
    addConv(conv) {
        let {styleId, name} = conv
        this.idTo.set(styleId, conv)
        this.nameTo.set(name, conv)
        this.idToName.set(styleId, name)
    }
    getStyleObj(name) {
        let conv = this.nameTo.get(name);
        if(conv)
            return conv.styleObj;
    }
    getConv(name) {
        return this.nameTo.get(name);
    }
}

class FormatConvMap extends  StyleConvMap {
    newConv(style) {
        return new FormatConv(style, this.styleMap)
    }
    get styleNames() {
        return [...this.nameTo.keys()];
    }
    mergeStyleNames(curStyleMap){
        let names = curStyleMap ? curStyleMap.formatConvMap.styleNames : [];
        for(let name of this.nameTo.keys()){
            if(!names.includes(name)){
                names.push(name);
            }
        }
        return names;
    }
}

class FontConvMap extends  StyleConvMap {
    newConv(style) {
        return new FontConv(style, this.styleMap)
    }
    addConv(conv, formatConvMap) {
        let {styleId, name, linkId} = conv
        this.idTo.set(styleId, conv)
        this.nameTo.set(name, conv)
        this.idToName.set(styleId, name)
        if(linkId) {
            let formatName = formatConvMap.idToName.get(linkId);
            this.nameTo.set(formatName, conv);
        }
    }
}

class TableStyleConvMap extends  StyleConvMap {
    newConv(style) {
        return new TableStyleConv(style, this.styleMap)
    }

    getStyleObj(options) {
        let {style, look} = options;
        let conv = this.nameTo.get(style);
        //console.log('table style name', style)
        if (conv)
            return conv.getCxClassWithLook(look);
    }
}

export {FormatConvMap, FontConvMap, TableStyleConvMap}


