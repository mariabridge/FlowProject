import axios from "axios";

/* export function fetchUser() {
	return dispatch => {
		axios.get("/api/get/user").then((response)=> {
			
			this.setState({
				firstname: response.data.first_name,
				lastname: response.data.last_name,
				picURL: response.data.pic_url,
			});

		}).catch(function(error) {
			console.log(error);
		});
	};
}*/


export function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => { 
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}



export function recieveUser(data) {
	return {
		type: "FETCH_USER_FULFILLED",
		payload: data,
	};
}

export function fetchUser() {  
	
	return dispatch => {
		dispatch({ type: "FETCH_USER" });
		axios.get("/api/get/user").then((response)=> {

			if(!response.data){
				dispatch({ type: "FETCH_USER_REJECTED" });
			} else {
				dispatch(recieveUser(response.data));
			}

		}).catch(function(error) {
			dispatch({ type: "FETCH_USER_REJECTED", error });
		});
	};
}
