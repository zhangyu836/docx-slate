import {css} from '@emotion/css';

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
        minHeight: '792pt',
        width: '612pt',
        display: 'flex',
        flexFlow: 'row'
    };
    return css(style);
}

const Section = ({ attributes, children, element }) => {
    if (element) {
        switch (element.type) {
            case 'section' :
                let style = element.style ? element.style : sectionStyle();
                return (
                    <div className={style} {...attributes}>
                        {children}
                    </div>
                );
            case 'column' :
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
}
export {Section};
