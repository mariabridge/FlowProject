import React from "react";

import FlowLayout from "../FlowLayout";
import ChangeColor from "../ChangeColor";

import FaFacebook from "react-icons/lib/fa/facebook-official";
import FaGoogle from "react-icons/lib/fa/google-plus-square";
import FaLinkedIn from "react-icons/lib/fa/linkedin-square";

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
		//this.handleSubmit = this.handleSubmit.bind(this);
	}

	render() {
		return (
    		<FlowLayout>

  				<form action={this.props.action} method={this.props.method} name="saveProjectForm">
					<input type="text" name="project_title" value={this.state.value} onChange={this.handleChange} placeholder="Namnge projekt" autoFocus="autoFocus" className="project_title"/>
				  	<h4 className="faded"> 6 imponerande flöden utifrån 9 system. Låt oss spara dem åt dig </h4><br/>
				  
					<ChangeColor/>
					<button className="btn btn-sign-in" onClick={this.fbLogin}>
						<FaFacebook style={iconStyle}/>
						<span>Spara med Facebook</span>
					</button><br/>
					<button className="btn btn-sign-in" onClick={this.goLogin}>
						<FaGoogle style={iconStyle}/>
						<span>Spara med Google</span>
					</button><br/>
					<button className="btn btn-sign-in" onClick={this.liLogin}>
						<FaLinkedIn style={iconStyle}/>
						<span>Spara med LinkedIn</span>
					</button><br/>
				</form>
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
	/*handleSubmit(event) {
		//this.state.value
		
		console.log(this.props.method)
	}*/
	
}


SaveProject.defaultProps = {
    action: '/save_project',
    method: 'post'
};
