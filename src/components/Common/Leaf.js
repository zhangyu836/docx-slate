import React from 'react';
import {useSlate} from 'slate-react';
import {FontConv} from '../../docx/fontConv';

const Leaf = ({ attributes, children, leaf }) => {
	let font = leaf;
	let parent = children.props.parent;
	if(parent){
		let editor = useSlate();
		let type = editor.typeConv(parent.type);
		let parFont = editor.getFont(type);
		font = Object.assign({}, parFont, leaf);
	}
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
