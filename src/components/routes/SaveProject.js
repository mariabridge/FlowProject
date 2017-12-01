import React from "react";

import FlowLayout from "../FlowLayout";
import ChangeColor from "../ChangeColor";

import FaFacebook from "react-icons/lib/fa/facebook-official";
import FaGoogle from "react-icons/lib/fa/google-plus-square";
import FaLinkedIn from "react-icons/lib/fa/linkedin-square";
import graphUtils from "../Flow4/utilities.js";

require("../styles/LoginStyle.scss");

const iconStyle = {
	fontSize: "54px",
};


export default class SaveProject extends React.Component {
	// TODO: Get actual amount of flows/systems
	
	constructor(props) {
		super(props);
		this.state = {
		  value: ''
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	render() {
		return (
    		<FlowLayout>
				<h2 className="faded">Save Project</h2>
				<h4 className="faded"> 6 imponerande flöden utifrån 9 system. Låt oss spara dem åt dig </h4><br/>
				<ChangeColor/>
				<button className="btn btn-register-in facebook-radius" onClick={this.fbLogin}>
					<FaFacebook style={iconStyle}/>
				</button>
				<button className="btn btn-register-in" onClick={this.goLogin}>
					<FaGoogle style={iconStyle}/>
				</button>
				<button className="btn btn-register-in last-btn-register" onClick={this.liLogin}>
					<FaLinkedIn style={iconStyle}/>
				</button><br/><br/>

				<div class="login_box">
					<div id="save-project">
						<form name="saveProjectForm" id="login-form">
							<div className="form-group">
								<input type="text" name="project_title" value={this.state.value} onChange={this.handleChange} placeholder="Name the project" autoFocus="autoFocus" className="project_title"/>
							</div>
							<button type="button" className="btn btn-login-btn"  onClick={this.handleSubmit} >
								Save Project <span>→</span>
							</button><br/><br/>
						</form>
					</div>

				</div>
  			</FlowLayout>
    	);
	}

	fbLogin() {
    	window.location = "/auth/facebook";
	}
	goLogin() {
    	window.location = "/auth/google";
	}
	liLogin() {
		window.location = "/auth/linkedin";
	}
	handleChange(event) {
		this.setState({value: event.target.value});
	}
	handleSubmit(event) {
		graphUtils.StoreFlowGraph(this.state.value)
	}
	
}
