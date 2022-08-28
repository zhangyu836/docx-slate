import React, { useEffect, useState } from 'react';
import { allColors, assignedColors, placeDiv } from './highlightUtilFunctions';
import '../../styles/editor.css';

const Tag = ({ children, coords }) => {
	const [yPos, setYPos] = useState(0);

	// after y coordinates are passed in props, assign the tag colors and place the tag div
	useEffect(() => {
		if (coords.y) {
			setYPos(coords.y);
			if (!assignedColors[yPos]) {
				assignedColors[yPos] = allColors.pop();
			}
		}
	}, [coords, yPos]);

	useEffect(() => {
		if (yPos) {
			// send the most recently selected text to place in the tag
			placeDiv(yPos, window.getSelection().toString());
		}
	}, [yPos]);

	return (
		<span
			style={{
				background: allColors[yPos],
			}}
			className={`tag-highlight ${yPos > 0 ? yPos : ''}`}>
			{children}
		</span>
	);
};

export default Tag;
