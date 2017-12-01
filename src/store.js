import { applyMiddleware, createStore, compose  } from "redux";

import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

import reducer from "./reducers";

const devMode = (process.env.NODE_ENV === "development");

let middleware;

let logger = createLogger({
	collapsed: true,
});

if(devMode) {
	middleware = applyMiddleware(promise(), thunk, logger);
} else {
	middleware = applyMiddleware(promise(), thunk);
}

export default createStore(
	reducer,
	compose(
		middleware
	)
);
