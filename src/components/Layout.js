import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// COMPONENTS //
import Header from "./Header";
import Background from "./Background";

import { fetchUser } from "../actions/userActions";

@connect()

export default class Layout extends Component {

	componentWillMount() {
		this.props.dispatch(fetchUser());
	}

	render() {
		return (
    		<div>
				<Background />
				<Header />
				{this.props.children}
			</div>
		);
	}
}

Layout.propTypes = {
	children: PropTypes.node.isRequired,
	dispatch: PropTypes.func,
};
