
class AbstractNum {
    _counterName(id, lvl){
        return `num${id}_${lvl}`;
    }
    get counterName(){
        return this._counterName(this.id, this.level);
    }
    content(){
        let ret = this.lvlText.replace(/%\d*/g, s => {
            let lvl = parseInt(s.substring(1)) - 1;
            return `"counter(${this._counterName(this.id, lvl)}, ${this.numFmt})"`;
        });
        return `"${ret}\\9"`;
    }
    get styleObj(){
        let counter = this.counterName;
        let obj = {
            display: "list-item",
            listStylePosition: "inside",
            listStyleType: 'none'
        }
        if (this.level > 0) {
            obj.counterReset = counter;
        }
        let before = {
            content: this.content(),
            counterIncrement: counter
        }
        if(this.numFmt==="bullet") before.fontFamily = "Symbol";
        obj["::before"] = before;
        return obj;
    }
}
class NumberingMap {
    constructor() {
        this.map = new Map();
    }
    load(elem){
        let abstractNums = elem.findall('w:abstractNum')
        for(let abstractNumElem of abstractNums){
            if (!abstractNumElem.lvl.pStyle)
                continue;
            let abstractNum = new AbstractNum();
            abstractNum.id = abstractNumElem.abstractNumId;
            abstractNum.level = abstractNumElem.lvl.ilvl;
            abstractNum.start = abstractNumElem.lvl.start.val;
            abstractNum.numFmt = abstractNumElem.lvl.numFmt.val;
            abstractNum.lvlText = abstractNumElem.lvl.lvlText.val;
            abstractNum.lvlJc = abstractNumElem.lvl.lvlJc.val;
            let pStyle = abstractNumElem.lvl.pStyle.val;
            this.map.set(pStyle, abstractNum);
        }
    }
    has(key){
        return this.map.has(key);
    }
    get(key){
        return this.map.get(key);
    }
    get globalCounterReset(){
        let counterNames = [];
        for (let value of this.map.values()){
            if (value.level===0)
                counterNames.push(value.counterName)
        }
        return {"counterReset": counterNames.join(" ")}
    }
}
function loadNumbering(docx){
    let numberingElem;
    let numberingMap = new NumberingMap();
    try{
        numberingElem = docx.part.numbering_part.element;
    } catch (e) {
        return numberingMap;
    }
    numberingMap.load(numberingElem);
    return numberingMap;
}
export {loadNumbering};



