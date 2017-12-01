export function changeBackground(color) {
	return {
		type: "CHANGE_BACKGROUND",
		payload: {
			color: color,
		},
	};
}

export function changeHighlighted(title) {
	return {
		type: "CHANGE_HIGHLIGHTED",
		payload: {
			selected: title,
		},
	};
}

export function changeExpanded(title) {
	return {
		type: "CHANGE_EXPANDED",
		payload: {
			expanded: title,
		},
	};
}
