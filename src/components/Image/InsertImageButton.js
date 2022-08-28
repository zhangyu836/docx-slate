import React from 'react';
import { useSlateStatic } from 'slate-react';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { Transforms } from 'slate';

import Button from '../Common/Button';
import Icon from '../Common/Icon';

// wrapper function to mempize editor with images
export const withImages = (editor) => {
	const { insertData, isVoid } = editor;

	editor.isVoid = (element) => {
		return element.type === 'image' ? true : isVoid(element);
	};

	editor.insertData = (data) => {
		const text = data.getData('text/plain');
		const { files } = data;

		if (files && files.length > 0) {
			for (const file of files) {
				const reader = new FileReader();
				const [mime] = file.type.split('/');

				if (mime === 'image') {
					reader.addEventListener('load', () => {
						const url = reader.result;
						insertImage(editor, url);
					});

					reader.readAsDataURL(file);
				}
			}
		} else if (isImageUrl(text)) {
			insertImage(editor, text);
		} else {
			insertData(data);
		}
	};

	return editor;
};

// insert image node to slate editor
const insertImage = (editor, url) => {
	const text = { text: '' };
	const image = { type: 'image', url, children: [text] };
	Transforms.insertNodes(editor, image);
};

// check if image url exists
const isImageUrl = (url) => {
	if (!url) return false;
	if (!isUrl(url)) {
		console.log('huh');
		return false;
	}
	const ext = new URL(url).pathname.split('.').pop();
	return imageExtensions.includes(ext);
};

// toolbar option to insert image url
export const InsertImageButton = ({ title }) => {
	const editor = useSlateStatic();
	return (
		<Button
			title={title}
			onMouseDown={(event) => {
				event.preventDefault();
				const url = window.prompt('Enter the URL of the image:');
				if (url && !isImageUrl(url)) {
					alert('URL is not an image');
					return;
				}
				insertImage(editor, url);
			}}>
			<Icon>image</Icon>
		</Button>
	);
};
