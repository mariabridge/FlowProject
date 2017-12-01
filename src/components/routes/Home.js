import React from "react";
import { Link } from "react-router";

require("../styles/HomeStyle.scss");
require("../styles/LinkStyle.scss");

export default class Home extends React.Component {
	render() {
		return (
			<div className="absolute-center">
				<Link to="flowhow4" className="link filled"> FlowHow v4 </Link>
			</div>
    	);
	}
}
