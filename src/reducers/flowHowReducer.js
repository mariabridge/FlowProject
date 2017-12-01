export default function reducer(state = {
	flows: {},
}, action) {
	switch (action.type) {
	case "CREATE_FLOW": {
		return { state};
	}
	case "REMOVE_FLOW": {
		localStorage.setItem("flows", JSON.stringify(action.payload) );
		return { ...state, flows: action.payload };
	}
	case "UPDATE_FLOW": {
		localStorage.setItem("flows", JSON.stringify(action.payload) );
		return { ...state, flows: action.payload };
	}
	default: {
		return state;
	}
	}
}
