
class AbstractNum {
    _counterName(id, lvl){
        return `num${id}_${lvl}`;
    }
    get counterName(){
        return this._counterName(this.id, this.level);
    }
    get content(){
        let ret = this.lvlText.replace(/%\d*/g, s => {
            let lvl = parseInt(s.substring(1)) - 1;
            return `"counter(${this._counterName(this.id, lvl)}, ${this.numFmt})"`;
        });
        return `"${ret}\\9"`;
    }
    get styleObj(){
        let counter = this.counterName;
        let before = {
            content: this.content,
            counterIncrement: counter
        }
        if(this.numFmt==="bullet") before.fontFamily = "Symbol";
        let obj = {
            display: "list-item",
            listStylePosition: "inside",
            listStyleType: 'none',
            "::before": before
        }
        if (this.level > 0) {
            obj.counterReset = counter;
        }
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
    getCounterReset(curNumbering) {
        let keys = [], counters = [];
        if(curNumbering) {
            keys = [...curNumbering.map.keys()];
            counters = [...curNumbering.map.values()];
        }
        for(let [key,counter] of this.map.entries()){
            if(!keys.includes(key)) counters.push(counter);
        }
        let counterNames = [];
        for (let value of counters){
            if (value.level===0)
                counterNames.push(value.counterName)
        }
        return {"counterReset": counterNames.join(" ")};
    }
}
function loadNumbering(docx){
    let numberingElem;
    let numberingMap = new NumberingMap();
    try{
        numberingElem = docx.part.numbering_part._element;
    } catch (e) {
        return numberingMap;
    }
    numberingMap.load(numberingElem);
    return numberingMap;
}
export {loadNumbering};



