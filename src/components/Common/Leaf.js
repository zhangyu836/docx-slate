import React from 'react';
import {Editor, Element as SlateElement} from 'slate'
import {ReactEditor, useSlate} from 'slate-react';
import {FontConv} from '../../docx/fontConv';

const Leaf = ({ attributes, children, leaf, text }) => {
	let font = leaf;
	let editor = useSlate();
	let path = ReactEditor.findPath(editor, text)
	const [matchParagraph] =
		Editor.nodes(editor, {
				at: path,
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) && n.type==='paragraph',
			}
		);
	if(matchParagraph){
		let parent = matchParagraph[0];
		let styleName = parent.style;
		let parFont = editor.getFont(styleName);
		let runFont = {};
		if(text.style){
			runFont = editor.getFont(text.style);
		}
		font = Object.assign({}, parFont, runFont, leaf);
	}
    /*
	const [matchTable] =
		Editor.nodes(editor, {
				at: path,
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) && n.type==='table',
			}
		);
	if(matchTable) {
	}*/

	if(font.strike) {
		children = <s>{children}</s>;
	}
	if(font.superscript){
		children = <sup>{children}</sup>;
	}
	if(font.subscript){
		children = <sub>{children}</sub>;
	}
	let style = FontConv.toStyleObj(font);
	if(Object.keys(style).length>0){
		return <span style={style} {...attributes}>{children}</span>;
	}
	return <span {...attributes}>{children}</span>;
};

export default Leaf;
