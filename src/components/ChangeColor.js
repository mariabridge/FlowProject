import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { uniqueId } from "lodash";

import { changeBackground } from "../actions/settingsActions";

require("./styles/ChangeColorStyle.scss");

@connect()

export default class ChangeColor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: document.body.style.background,
		};
	}

	render() {
    	const colors = [
			    		"rgb(108, 70, 125)", // Deep purple
			    		"rgb(110, 90, 180)", // Brighter purple 
			    		"rgb(66, 76, 149)", // Deep blue  			
			    		"rgb(53, 135, 205)", // Light blue
			    		"rgb(132, 181, 69)", // Entiros light green
			"rgb(10, 128, 95)", // Dark green
			"rgb(60, 60, 60)", // Dark green
		];

		const colorButtons = colors.map( (color)=>{
			return (
				<div key = {uniqueId("color_dot_")}
					className={"change-color-dot" + (this.state.selected === color ? " active" : "")}
					style={{backgroundColor: color}}
					onClick={this.changeColor.bind(this)} />
			);
		});

		return (
        	<div className="change-color-container">
    			{colorButtons}
			</div>
		);
	}
	changeColor(e) {
		// To get a smooth transition back to initial size when removing the active class from a dot
		// the component can't be rerendered. 
		// Instead remove class from all other dots

		const c = e.target.style.backgroundColor;
		
		this.props.dispatch(changeBackground(c));
		
		this.setState({
			selected: c,
		});
	}	
}

ChangeColor.propTypes = {
	dispatch: PropTypes.func,
};
