import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, browserHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";


import store from "./store";
import { routes } from "./routes";

const history = syncHistoryWithStore(browserHistory, store);

// Force hot module reloading 

if (process.env.NODE_ENV !== "production") {
	if (module.hot) {
	  module.hot.accept();
	}
}

render(
	<Provider store={store}>
  		<Router history={history} routes={routes} />
	</Provider>,
	document.getElementById("app")
);

// render(
// 	<Provider store={store}>
//   		<Router history={history} routes={routes} />
// 	</Provider>,
// 	document.getElementById('app')
// );
