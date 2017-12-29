import React from "react";
import { Link } from "react-router";

require("../styles/HomeStyle.scss");
require("../styles/LinkStyle.scss");

export default class Home extends React.Component {
	render() {
		return (
			<div className="absolute-center col-xs-12">
				<h2 className="home_title">Get going with integration <br/>in a matter of minutes, with FlowProject</h2>
				<Link to="dashboard" className="link filled"> Flow Project </Link>
			</div>
    	);
	}
}

