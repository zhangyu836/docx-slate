import {useSlate} from 'slate-react';
import {FormatConv} from '../../docx/style/styleConv';
import {Table, Row, Cell} from './Table';
import {Section, Column} from "./Section";
import { LinkComponent } from '../Link/LinkComponent';


const Elements = (props) => {
	let  { attributes, children, element } = props;
	if (element) {
		switch (element.type) {
			case 'section' :
				return <Section {...props} />;
			case 'column' :
				return <Column {...props} />;
			case 'table':
				return <Table {...props} />;
			case 'row':
				return <Row {...props} />;
			case 'cell':
				return <Cell {...props} />;
			case 'hyperlink' :
				return <LinkComponent {...props} />;
			case 'paragraph':
				let editor = useSlate();
				let styleName = element.style;
				let formatStyle = editor.getFormatStyle(styleName);
				let cls = editor.getCssClass(styleName)
				let styleObj = FormatConv.toStyleObj(element);
				let style = {...formatStyle, ...styleObj};
				return (
					<p className={cls} style={style} {...attributes}>
						{children}
					</p>
				);
		}
	}
};

export default Elements;
