import React from 'react';
import { useSlate } from 'slate-react';
import {Editor, Element as SlateElement} from 'slate';
import Button from '../Common/Button';
import Icon from '../Common/Icon';


export const MarkButton = ({ format, icon, title }) => {
	const editor = useSlate();
	return (
		<Button
			title={title}
			active={isMarkActive(editor, format)}
			onMouseDown={(event) => {
				event.preventDefault();
				toggleMark(editor, format);
			}}>
			<Icon>{icon}</Icon>
		</Button>
	);
};

// to control the toggling of the mark level buttons
export const toggleMark = (editor, format) => {
	let runMarks = Editor.marks(editor);
	let parMarks = getParMarks(editor);
	let runMark = runMarks[format];
	let parMark = parMarks[format];
	if (runMark===true) {
		if(parMark){
			Editor.addMark(editor, format, false);
		} else {
			Editor.removeMark(editor, format);
		}
	} else if(runMark===false){
		if (parMark) {
			Editor.removeMark(editor, format);
		} else {
			Editor.addMark(editor, format, true);
		}
	} else{
		if (parMark) {
			Editor.addMark(editor, format, false);
		} else {
			Editor.addMark(editor, format, true);
		}
	}
};
function getParMarks(editor){
	let marks = {};
	let {selection} = editor;
	if(selection){
		const [matchParagraph] = Editor.nodes(editor, {
				at: Editor.unhangRange(editor, selection),
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n)&&
					Editor.isBlock(editor, n) && (n.type==='paragraph'),
			}
		);
		if(matchParagraph){
			let styleName = matchParagraph[0].style;
			//console.log('match paragraph', matchParagraph[0])
			marks = editor.getFont(styleName);
		}
		const [matchText] = Editor.nodes(editor, {
				at: Editor.unhangRange(editor, selection),
				match: (n) =>
					!Editor.isEditor(n) &&
					n.text && n.style,
			}
		);
		if(matchText){
			let styleName = matchText[0].style;
			let runMarks = editor.getFont(styleName)
			marks = {...marks, ...runMarks}
		}
	}
	return marks
}

// check if mark button is toggled currently
export const isMarkActive = (editor, format) => {
	let runMarks = Editor.marks(editor);
	let parMarks = getParMarks(editor);
	let marks = {...parMarks, ...runMarks}
	return marks ? marks[format] === true : false;
};
