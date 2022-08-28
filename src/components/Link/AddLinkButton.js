import React from 'react';
import { isLinkActive, insertLink } from './linkUtilFunctions';
import { useSlate } from 'slate-react';
import Button from '../Common/Button';
import Icon from '../Common/Icon';

// button to add links in the toolbar of editor
const AddLinkButton = ({ title }) => {
	const editor = useSlate();
	return (
		<Button
			title={title}
			active={isLinkActive(editor)}
			onMouseDown={(event) => {
				event.preventDefault();
				const url = window.prompt('Enter the URL of the link:');
				if (!url) return;
				insertLink(editor, url);
			}}>
			<Icon>link</Icon>
		</Button>
	);
};

export default AddLinkButton;
