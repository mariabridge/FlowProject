import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

require("./styles/BackgroundStyle.scss");

@connect((store)=>{
	return store.settings;
})


export default class Background extends Component {


	render() {
		return (
			<div className="background" style={{backgroundColor: this.props.bgColor}} />
		);
	}
}

Background.propTypes = {
	bgColor: PropTypes.string,
};
