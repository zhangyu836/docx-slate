import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import Button from '../Common/Button';
import Icon from '../Common/Icon';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

// function to handle the toggling action on block level buttons
export const toggleBlock = (editor, format) => {
	// to check if block button is currently active
	const isActive = isBlockActive(
		editor,
		format,
		TEXT_ALIGN_TYPES.includes(format) ? 'alignment' : 'type'
	);
	const isList = LIST_TYPES.includes(format);

	// unwrap Slate nodes at specified location
	Transforms.unwrapNodes(editor, {
		match: (n) =>
			!Editor.isEditor(n) &&
			SlateElement.isElement(n) &&
			LIST_TYPES.includes(n.type) &&
			!TEXT_ALIGN_TYPES.includes(format),
		split: true,
	});

	let newProperties;

	// once toggled, add new style properties to selected block
	if (TEXT_ALIGN_TYPES.includes(format)) {
		newProperties = {
			alignment: isActive ? undefined : format,
		};
	} else {
		newProperties = {
			type: isActive ? 'paragraph' : isList ? 'list-item' : format,
		};
	}

	// set node with updated properties
	Transforms.setNodes(editor, newProperties);

	// wrap the entire selection to apply block level style
	if (!isActive && isList) {
		const block = { type: format, children: [] };
		Transforms.wrapNodes(editor, block);
	}
};

// to check if block is currently toggled on
export const isBlockActive = (editor, format, blockType = 'type') => {
	const { selection } = editor;
	if (!selection) return false;

	// check if editor object matches one of the block level element options
	const [match] = Array.from(
		Editor.nodes(editor, {
			at: Editor.unhangRange(editor, selection),
			match: (n) => {
				if(!Editor.isEditor(n))
					if(SlateElement.isElement(n)){
						let type = n[blockType];
						if(blockType==='type')
							 type = editor.typeConv(type);
						return type === format;
					}
			}
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
				TEXT_ALIGN_TYPES.includes(format) ? 'alignment' : 'type'
			)}
			onMouseDown={(event) => {
				event.preventDefault();
				toggleBlock(editor, format);
			}}>
			<Icon>{icon}</Icon>
		</Button>
	);
};
