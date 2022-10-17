import isUrl from 'is-url';
import { Transforms, Range, Element as SlateElement, Editor } from 'slate';

// wrapper function to add links to the memoised editor
export const withLinks = (editor) => {
	const { insertData, insertText, isInline } = editor;

	editor.isInline = (element) =>
		['hyperlink', 'button'].includes(element.type) || isInline(element);

	editor.insertText = (text) => {
		if (text && isUrl(text)) {
			wrapLink(editor, text);
		} else {
			insertText(text);
		}
	};

	editor.insertData = (data) => {
		const text = data.getData('text/plain');

		if (text && isUrl(text)) {
			wrapLink(editor, text);
		} else {
			insertData(data);
		}
	};

	return editor;
};

// wrap the link node is link url is added
export const insertLink = (editor, url) => {
	if (editor.selection) {
		wrapLink(editor, url);
	}
};

// check if link option is toggled
export const isLinkActive = (editor) => {
	const [link] = Editor.nodes(editor, {
		match: (n) =>
			!Editor.isEditor(n) &&
			SlateElement.isElement(n) &&
			n.type === 'link',
	});
	return !!link;
};

// remove the link by unwrapping the link leaves from the editor
export const unwrapLink = (editor) => {
	Transforms.unwrapNodes(editor, {
		match: (n) =>
			!Editor.isEditor(n) &&
			SlateElement.isElement(n) &&
			n.type === 'link',
	});
};

// add the link by wrapping the link leaves from the editor
export const wrapLink = (editor, url) => {
	// wnwrap if clicked twice
	if (isLinkActive(editor)) {
		unwrapLink(editor);
	}

	const { selection } = editor;
	const isCollapsed = selection && Range.isCollapsed(selection);
	const link = {
		type: 'link',
		url,
		children: isCollapsed ? [{ text: url }] : [],
	};

	if (isCollapsed) {
		Transforms.insertNodes(editor, link);
	} else {
		Transforms.wrapNodes(editor, link, { split: true });
		Transforms.collapse(editor, { edge: 'end' });
	}
};
