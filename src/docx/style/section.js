import {css} from '@emotion/css';
import { v4 as uuid } from 'uuid';
import {elementTypes} from "../types";
import {PPrConv, RPrConv} from "./prConv";

class SectionMap {
    constructor(sections, styleMap) {
        this.sections = sections;
        this.styleMap = styleMap;
        this.map = new Map();
        this.preOrientation = null;
        //this.preKey = null;
        this.preSection = null;
    }
    getSectionElement(index) {
        let _section = this.sections[index];
        let first = (index===0);
        let last = (index===this.sections.length-1);
        let section = new Section(_section, first, last, this.styleMap);
        this.map.set(section.key, section);
        let curOrientation = section.orientation;
        if(first) {
            this.preOrientation = curOrientation;
            this.preSection = section;
        } else {
            if (this.preOrientation !== curOrientation) {
                section.first = true;
                this.preOrientation = curOrientation;
                this.preSection.last = true;
            }
        }
        if(last) this.preSection = null;
        return section.sectionElement;
    }
    getSectPr(key) {
        let section = this.map.get(key);
        return section.sectPr;
    }

    getSectionStyle(key) {
        let section = this.map.get(key);
        if (section)
            return section.styleClass;
    }
}

function getEmptyPara(text) {
    return {
        type: 'paragraph',
        style: 'Normal',
        children: [ { text } ]
    }
}

class Section {
    constructor(section, first, last, styleMap) {
        this.key = uuid();
        this.section = section;
        this.first = first;
        this.last = last;
        this.styleMap = styleMap;
    }
    get orientation() {
        return this.section.orientation;
    }
    get sectionElement() {
        let width = this.section.page_width.pt -
            this.section.left_margin.pt -
            this.section.right_margin.pt;
        let children = [];
        let cols = this.section._sectPr.cols;
        if (!cols) {
            let col_element = {
                type: elementTypes.COLUMN,
                width: width,
                space: 0,
                children: [getEmptyPara('n1')]
            }
            children.push(col_element);
        } else {
            let col_lst = cols.col_lst;
            if (col_lst.length === 0) {
                let col_element = {
                    type: elementTypes.COLUMN,
                    width: width,
                    space: cols.space ? cols.space.pt : 0,
                    children: [getEmptyPara('n2')]
                }
                children.push(col_element);
            } else {
                for (let col of col_lst) {
                    let col_element = {
                        type: elementTypes.COLUMN,
                        width: col.w.pt,
                        space: col.space ? col.space.pt : 0,
                        children: [getEmptyPara('n3')]
                    }
                    children.push(col_element);
                }
            }
        }
        return {
            children: children,
            colIndex: 0,
            key: this.key,
            style: this.styleClass,
            type: elementTypes.SECTION
        }
    }
    get sectPr() {
        return this.section._sectPr;
    }
    get styleClass() {
        let style = {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'darkgray',
            backgroundColor: 'white',
            paddingLeft: '90pt',
            paddingRight: '90pt',
            width: '432pt',
            display: 'flex',
            flexFlow: 'row'
        };
        if(this.first) style.paddingTop = '72pt';
        if(this.last) {
            style.paddingBottom = '72pt';
        }
        if(this.first && this.last) style.minHeight = '648pt';
        if(this.section) {
            if(this.section.left_margin){
                style.paddingLeft = `${this.section.left_margin.pt}pt`;
                style.paddingRight = `${this.section.right_margin.pt}pt`;
                style.width = `${this.section.page_width.pt - this.section.left_margin.pt - this.section.right_margin.pt}pt`;
                if(this.first)
                    style.paddingTop = `${this.section.top_margin.pt}pt`;
                if(this.last) {
                    style.paddingBottom = `${this.section.bottom_margin.pt}pt`;
                }

                if(this.first && this.last)
                    style.minHeight = `${this.section.page_height.pt - this.section.top_margin.pt - this.section.bottom_margin.pt}pt`;
            }
        }
        style['& p[data-slate-node]'] = PPrConv.toStyleObj(this.styleMap.defaultFormat);
        style['& span[data-slate-leaf]'] = RPrConv.toStyleObj(this.styleMap.defaultFont);
        return css(style);
    }
}

function getSectionMap(docx, styleMap) {
    return new SectionMap(docx.sections, styleMap);
}

export {getSectionMap, Section, SectionMap};
