import React from "react";

import { Route, IndexRoute} from "react-router";

import Layout from "./components/Layout";
import FlowLayout2 from "./components/FlowLayout2";

import Error404 from "./components/routes/Error404";
import Home from "./components/routes/Home";
import Register from "./components/routes/Register";
import Login from "./components/routes/Login";
import SaveProject from "./components/routes/SaveProject";
import FlowHow4 from "./components/Flow4/FlowHow4";
import Dashboard from "./components/routes/Dashboard";

export const routes = (
	<Route path="/" component={Layout}>
		<IndexRoute component={Home}/>

		<Route path="flowhow4" component={FlowLayout2}>
			<IndexRoute component={FlowHow4}/>
		</Route>
		<Route path="flowhow4/:id" component={FlowLayout2}>
			<IndexRoute component={FlowHow4}/>
		</Route>

		<Route path="sign-in" component={Login}/>
		<Route path="register" component={Register}/>
		<Route path="save-project" component={SaveProject}/>
		<Route path="save-project/:id" component={SaveProject}/>
		<Route path="dashboard" component={Dashboard}/>
		<Route path="*" component={Error404}/>

	</Route>
);

