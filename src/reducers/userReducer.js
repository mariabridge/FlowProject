export default function reducer(state = {
	fetching: false,
	loggedIn: false,
	user: {
		first_name: null,
		last_name: null,
		pic_url: null,
		id: null,
	},
}, action) {
	switch (action.type) {
	case "FETCH_USER": {
		return {...state, fetching: true};
	}
	case "FETCH_USER_REJECTED": {
		return {...state, 
			fetching: false, 
			error: action.payload,
			loggedIn: false,
		};
	}
	case "FETCH_USER_FULFILLED": {
		return {
			...state,
			fetching: false,
			user: action.payload,
			loggedIn: true,
		};
	}
	default: {
		return state;
	}
	}
}
