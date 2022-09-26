import {css} from '@emotion/css';

class Section {
    constructor(section) {
        this.section = section;
    }
    get pageStyle() {
        let obj = {
            width: '90%',
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            //fontFamily: 'Calibri',
            backgroundColor: 'lightsteelblue',
            padding: '27pt'
        }
        let pageStyle = {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'darkgray',
            backgroundColor: 'white',
            paddingLeft: '90pt',
            paddingRight: '90pt',
            paddingTop: '72pt',
            paddingBottom: '72pt',
            width: '612pt',
            minHeight: '792pt'
        };
        if(this.section) {
            if(this.section.left_margin){
                pageStyle.paddingLeft = `${this.section.left_margin.pt}pt`;
                pageStyle.paddingRight = `${this.section.right_margin.pt}pt`;
                pageStyle.paddingTop = `${this.section.top_margin.pt}pt`;
                pageStyle.paddingBottom = `${this.section.bottom_margin.pt}pt`;
                pageStyle.width = `${this.section.page_width.pt}pt`;
                pageStyle.minHeight = `${this.section.page_height.pt}pt`
            }
        }
        obj['.page'] = pageStyle
        return css(obj);
    }
}

function getSection(docx) {
    return new Section(docx.section);
}

export {getSection, Section};
