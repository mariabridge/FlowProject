export default function reducer(state = {
	bgColor: (window.localStorage.bgColor?window.localStorage.bgColor:"rgb(60, 60, 60)"),
	highlighted: null,
	expanded: null,
}, action) {
	switch (action.type) {
	case "CHANGE_BACKGROUND": {
		return {...state, bgColor: action.payload.color};
	}
	case "CHANGE_HIGHLIGHTED": {
		// Unhighligt all cells
		let allCells = window.graph.model.cells;
		let style;

		for(let i = 0; i < Object.keys(window.graph.model.cells).length; i++) {

			let key = Object.keys(window.graph.model.cells)[i];
			let node = allCells[key];

			if(node.style) {
				style = node.getStyle();
				style = style.replace(/\;fillColor=rgba\(255, 255, 255, 0.4\)/g, "");
				node.setStyle(style);
			}
		}

		window.graph.refresh();

		return {...state, highlighted: action.payload.selected };
	}
	case "CHANGE_EXPANDED": {
		return { ...state, expanded: action.payload.expanded }; 
	}
	default: {
		return state;
	}
	}
}
