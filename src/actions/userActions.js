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
