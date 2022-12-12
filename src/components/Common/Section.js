import {css} from '@emotion/css';
import {useSlate} from 'slate-react';

function sectionStyle() {
    let style = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'darkgray',
        backgroundColor: 'white',
        paddingLeft: '90pt',
        paddingRight: '90pt',
        paddingTop: '72pt',
        paddingBottom: '72pt',
        minHeight: '648pt',
        width: '432pt',
        display: 'flex',
        flexFlow: 'row'
    };
    return css(style);
}

const Section = ({ attributes, children, element }) => {
    if (element) {
        let editor = useSlate();
        let cssClass = editor.getSectionStyle(element.key);
        if(!cssClass) cssClass = sectionStyle();
        return (
            <div className={cssClass} {...attributes}>
                {children}
            </div>
        );
    }
}
const Column = ({ attributes, children, element }) => {
    if (element) {
        let styleObj = {
            width: `${element.width}pt`,
            marginRight: `${element.space}pt`,
        };
        return (
            <div style={styleObj} {...attributes}>
                {children}
            </div>
        );
    }
}
export {Section, Column};
