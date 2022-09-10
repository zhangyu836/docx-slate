import {useSlate} from 'slate-react';
import {cx, css} from '@emotion/css';
import {FormatConv} from '../../docx/formatConv';

const Elements = ({ attributes, children, element }) => {
	if (element) {
		let editor = useSlate();
		let type = editor.typeConv(element.type);
		let cls = editor.getCssClass(type);
		let styleObj = FormatConv.toStyleObj(element);
		return (
			//<p className={cls} style={styleObj} {...attributes}>
			<p className={cx(cls, css(styleObj))} {...attributes}>
				{children}
			</p>
		);
	}
};

export default Elements;
