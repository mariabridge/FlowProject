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


export default class Login extends React.Component {
	// TODO: Get actual amount of flows/systems

	render() {
		return (
    		<FlowLayout>
  				<h1> Salesforce App</h1>

				<ChangeColor/>

  				<h3 className="faded"> 6 imponerande flöden utifrån 9 system. Låt oss spara dem åt dig </h3><br/>

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
}
