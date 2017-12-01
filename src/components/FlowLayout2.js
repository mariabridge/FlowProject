import React, { Component } from "react";
import PropTypes from "prop-types";

// COMPONENTS //
import LearnHow from "./LearnHow";

// STYLES //
require("./styles/flowLayoutStyle.scss");


export default class FlowLayout2 extends Component {
	render() {
		return (
			<div>
    		<div className="centered">
					<div className="container-fluid container-flow-2 text-center">
						{this.props.children}
						<LearnHow />
					</div>
				</div>
			</div>
		);
	}
}

FlowLayout2.propTypes = {
	children: PropTypes.node.isRequired,
};
