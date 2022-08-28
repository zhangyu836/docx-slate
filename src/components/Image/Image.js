import React from 'react';
import {
	useSlateStatic,
	useSelected,
	useFocused,
	ReactEditor,
} from 'slate-react';
import { Transforms } from 'slate';
import { css } from '@emotion/css';

import Button from '../Common/Button';
import Icon from '../Common/Icon';

// handle image upload and add it to editor
const Image = ({ attributes, children, element }) => {
	const editor = useSlateStatic();
	const path = ReactEditor.findPath(editor, element);

	const selected = useSelected();
	const focused = useFocused();
	return (
		<div {...attributes}>
			{children}
			<div
				contentEditable={false}
				className={css`
					position: relative;
				`}>
				<img
					alt='alt'
					src={element.url}
					className={css`
						display: block;
						max-width: 100%;
						max-height: 20em;
						box-shadow: ${selected && focused
							? '0 0 0 3px #B4D5FF'
							: 'none'};
					`}
				/>
				<Button
					active
					onClick={() => Transforms.removeNodes(editor, { at: path })}
					className={css`
						display: ${selected && focused ? 'inline' : 'none'};
						position: absolute;
						top: 0.5em;
						left: 0.5em;
						background-color: white;
					`}>
					<Icon>delete</Icon>
				</Button>
			</div>
		</div>
	);
};

export default Image;
