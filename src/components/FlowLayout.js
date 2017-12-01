import React, { Component } from "react";
import PropTypes from "prop-types";

// COMPONENTS //
import LearnHow from "./LearnHow";

// STYLES //
require("./styles/flowLayoutStyle.scss");


export default class FlowLayout extends Component {
	render() {
		return (
			<div className="centered">
				<div className="jumbotron vertical-center">
					<div className="container text-center">
						{this.props.children}
						<LearnHow />
					</div>
				</div>
			</div>
		);
	}
}

FlowLayout.propTypes = {
	children: PropTypes.node.isRequired,
};
