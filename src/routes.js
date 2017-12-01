import React from "react";

import { Route, IndexRoute} from "react-router";

import Layout from "./components/Layout";
import FlowLayout2 from "./components/FlowLayout2";

import Error404 from "./components/routes/Error404";
import Home from "./components/routes/Home";
import Login from "./components/routes/Login";
import FlowHow4 from "./components/Flow4/FlowHow4";


export const routes = (
	<Route path="/" component={Layout}>
		<IndexRoute component={Home}/>

		<Route path="flowhow4" component={FlowLayout2}>
			<IndexRoute component={FlowHow4}/>
		</Route>

		<Route path="sign-in" component={Login}/>
		<Route path="*" component={Error404}/>

	</Route>
);

