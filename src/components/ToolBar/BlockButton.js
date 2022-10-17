import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import Button from '../Common/Button';
import Icon from '../Common/Icon';

const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

// function to handle the toggling action on block level buttons
export const toggleBlock = (editor, format) => {
	// to check if block button is currently active
	const isActive = isBlockActive(editor, format,
		TEXT_ALIGN_TYPES.includes(format) ? 'alignment' : 'style'
	);

	let newProperties;
	// once toggled, add new style properties to selected block
	if (TEXT_ALIGN_TYPES.includes(format)) {
		newProperties = {
			alignment: isActive ? undefined : format,
		};
	} else {
		newProperties = {
			style: isActive ? undefined : format,
		};
	}
	// set node with updated properties
	Transforms.setNodes(editor, newProperties);
};

// to check if block is currently toggled on
export const isBlockActive = (editor, format, blockType = 'style') => {
	const { selection } = editor;
	if (!selection) return false;

	// check if editor object matches one of the block level element options
	const [match] = Array.from(
		Editor.nodes(editor, {
			at: Editor.unhangRange(editor, selection),
			match: (n) =>	!Editor.isEditor(n) &&
				SlateElement.isElement(n) &&
				n.type==='paragraph' &&
				n[blockType] === format
		})
	);
	return !!match;
};

// the button element to style block elements from toolbar
export const BlockButton = ({ format, icon, title }) => {
	const editor = useSlate();
	return (
		<Button
			title={title}
			active={isBlockActive(
				editor,
				format,
				TEXT_ALIGN_TYPES.includes(format) ? 'alignment' : 'style'
			)}
			onMouseDown={(event) => {
				event.preventDefault();
				toggleBlock(editor, format);
			}}>
			<Icon>{icon}</Icon>
		</Button>
	);
};
