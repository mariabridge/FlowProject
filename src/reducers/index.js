import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import flowHow from "./flowHowReducer";
import user from "./userReducer";
import settings from "./settingsReducer";

export default combineReducers({
	flowHow, user, settings,
	routing: routerReducer,
});
