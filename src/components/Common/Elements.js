import {useSlate} from 'slate-react';
import {FormatConv} from '../../docx/formatConv';
import {Table} from './Table';
import {Section} from "./Section";
import { LinkComponent } from '../Link/LinkComponent';


const Elements = (props) => {
	let  { attributes, children, element } = props;
	if (element) {
		switch (element.type) {
			case 'section' :
			case 'column' :
				return <Section {...props} />;
			case 'hyperlink' :
				return <LinkComponent {...props} />;
			case 'table':
			case 'row':
			case 'cell':
				return <Table {...props} />;
			case 'paragraph':
				let editor = useSlate();
				let styleName = element.style;
				let format = editor.getFormat(styleName);
				let cls = editor.getCssClass(styleName)
				let styleObj = FormatConv.toStyleObj(element);
				let style = Object.assign({}, format, styleObj);
				return (
					<p className={cls} style={style} {...attributes}>
						{children}
					</p>
				);
		}
	}
};

export default Elements;
