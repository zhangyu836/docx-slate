import React from 'react';
import ReactDOM from 'react-dom';
import { colors } from './colors.js';

// to assign different colors to the different y-positions
export const assignedColors = {};

// to color backgrounds of highlighted text

export const allColors = shuffle(colors);

function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

// get the x and y coordinates of selected text
export const getSelectionCoords = () => {
	const sele = window.getSelection();
	const oRange = sele.getRangeAt(0);
	const oRect = oRange.getBoundingClientRect();
	return {
		x: Math.floor(oRect.x),
		y: Math.floor(oRect.y),
	};
};

// color the highlighted text
export const colorTags = () => {
	// fetch all spans which were highlighted
	const highlightTags = Array.from(
		document.querySelectorAll('.tag-highlight')
	);

	// since the text lies at the same y offset as the corresponding tag, use these values to assign bg color
	highlightTags.map((tag) => {
		const index = Math.floor(tag.getBoundingClientRect().y);
		tag.style.background = assignedColors[index];
		return null;
	});
};

// place the highlight tags in the DOM
export const placeDiv = (y_pos, text) => {
	const tagsContainer = document.querySelector('.tags');
	const tags = Array.from(document.querySelectorAll('.tag'));

	// craete a new Tag span with the correct y position to align it to the highlighted line
	const newTag = React.createElement(
		'span',
		{
			style: {
				position: 'absolute',
				left: `${tagsContainer.getBoundingClientRect().left}px`,
				top: `${y_pos}px`,
				background: `${assignedColors[y_pos]}`,
			},
			className: `tag ${y_pos}`,
			key: text,
		},
		`${text.substring(0, 15)}...`
	);

	const allTags = [];
	// fetch all previous tags and create a new Fragment to be rendered
	for (let i = 0; i < tags.length; i++) {
		// if multiple spans are selected in the same line, show tag of latest selection
		const sameLineTag = tags[i].className.includes(`${y_pos}`);

		if (!sameLineTag) {
			let newYPos = tags[i].className.split(' ')[1];
			const tag = React.createElement(
				'span',
				{
					style: {
						position: 'absolute',
						left: `${tags[i].offsetLeft}px`,
						top: `${tags[i].offsetTop}px`,
						background: `${assignedColors[newYPos]}`,
					},
					className: tags[i].className,
					key: i,
				},
				`${tags[i].innerText}`
			);
			allTags.push(tag);
		}
	}

	allTags.push(newTag);
	ReactDOM.render(allTags, tagsContainer); //render the tags in the parent container

	// color the highlighted text after a while
	colorTags();
};
