import {useSlate} from 'slate-react';
import {cx, css} from '@emotion/css';
import {FormatConv} from '../../docx/formatConv';

const Elements = ({ attributes, children, element }) => {
	//const props = { attributes, children, element };
	if (element) {
		let styleObj = FormatConv.toStyleObj(element);
		switch (element.type) {
			case 'block-quote':
				return (
					<blockquote style={styleObj} {...attributes}>
						{children}
					</blockquote>
				);

			case 'heading-one':
				return (
					<h1 style={styleObj} {...attributes}>
						{children}
					</h1>
				);
			case 'heading-two':
				return (
					<h2 style={styleObj} {...attributes}>
						{children}
					</h2>
				);
			case 'list-item':
				return (
					<li style={styleObj} {...attributes}>
						{children}
					</li>
				);
			case 'bulleted-list':
				return (
					<ol
						style={{ ...styleObj, listStyleType: 'circle' }}
						{...attributes}>
						{children}
					</ol>
				);
			case 'numbered-list':
				return (
					<ol style={styleObj} {...attributes}>
						{children}
					</ol>
				);
			default:
				let editor = useSlate();
				let cls = editor.getCssClass(element.type);
				return (
					//<p className={cls} style={styleObj} {...attributes}>
					<p className={cx(cls, css(styleObj))} {...attributes}>
						{children}
					</p>
				);
		}
	}
};

export default Elements;
