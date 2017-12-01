import React from "react";
import { FormErrors } from './FormErrors';

import FlowLayout from "../FlowLayout";
import ChangeColor from "../ChangeColor";

import FaFacebook from "react-icons/lib/fa/facebook-official";
import FaGoogle from "react-icons/lib/fa/google-plus-square";
import FaLinkedIn from "react-icons/lib/fa/linkedin-square";
import { Link } from "react-router";

require("../styles/RegisterStyle.scss");


const iconStyle = {
	fontSize: "54px",
};


export default class Register extends React.Component {
	// TODO: Get actual amount of flows/systems

	constructor (props) {
		super(props);
		this.state = {
		  firstname: '',
		  password: '',
		  surname: '',
		  business: '',
		  roll: '',
		  mail: '',
		  formErrors: {firstname: '', password: '', surname: '', business: '', roll: '', mail: ''},
		  emailValid: false,
		  surnameValid: false,
		  businessValid: false,
		  rollValid: false,
		  mailValid: false,
		  passwordValid: false,
		  formValid: false
		}
	  }

	handleUserInput = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		this.setState({[name]: value},
					  () => { this.validateField(name, value) });
	  }
	
	  validateField(fieldName, value) {
		let fieldValidationErrors = this.state.formErrors;
		let firstnameValid = this.state.firstnameValid;
		let passwordValid = this.state.passwordValid;
		let surnameValid = this.state.surnameValid;
		let businessValid = this.state.businessValid;
		let rollValid = this.state.rollValid;
		let mailValid = this.state.mailValid;
		
		switch(fieldName) {
			case 'firstname':
				firstnameValid = value.length >= 1;
				fieldValidationErrors.firstname = firstnameValid ? '' : ' is invalid';
				break;
			case 'surname':
				surnameValid = value.length >= 1;
				fieldValidationErrors.surname = surnameValid ? '' : ' is required';
				break;
			case 'business':
				businessValid = value.length >= 1;
				fieldValidationErrors.business = businessValid ? '' : ' is required';
					break;	
			case 'roll':
				rollValid = value.length >= 1;
				fieldValidationErrors.roll = rollValid ? '' : ' is required';
				break;
			case 'mail':
				mailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
				fieldValidationErrors.mail = mailValid ? '' : ' is invalid';
				break;
		  	case 'password':
				passwordValid = value.length >= 6;
				fieldValidationErrors.password = passwordValid ? '': ' is too short';
				break;
		  	default:
				break;
		}
		this.setState({formErrors: fieldValidationErrors,
						firstnameValid: firstnameValid,
						surnameValid: surnameValid,
						businessValid: businessValid,
						rollValid: rollValid,
						mailValid: mailValid,
						passwordValid: passwordValid
					  }, this.validateForm);
	  }
	
	  validateForm() {
		this.setState({formValid: this.state.firstnameValid && this.state.surnameValid && this.state.businessValid && this.state.rollValid && this.state.mailValid && this.state.passwordValid});
	  }
	
	  errorClass(error) {
		return(error.length === 0 ? '' : 'has-error');
	  }

	render() {
		return (
    		<FlowLayout>
  				<h2 class="register_title"> REGISTRATION </h2>
  				<h3 className="faded"> En vårld </h3><br/>
				<ChangeColor/>

				<div class="register_btn">
					<button className="btn btn-register-in facebook-radius" onClick={this.fbLogin}>
						<FaFacebook style={iconStyle}/>
					</button>
					<button className="btn btn-register-in" onClick={this.goLogin}>
						<FaGoogle style={iconStyle}/>
					</button>
					<button className="btn btn-register-in last-btn-register" onClick={this.liLogin}>
						<FaLinkedIn style={iconStyle}/>
					</button><br/><br/>

					<form action={this.props.action} method={this.props.method}>
						<div className={`form-group ${this.errorClass(this.state.formErrors.firstname)}`}>
							<input type="text" required className="form-control" name="firstname"
								placeholder="First Name"
								value={this.state.firstname}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.firstname}</span>
						</div>
						<div className={`form-group ${this.errorClass(this.state.formErrors.surname)}`}>
							<input type="text" className="form-control" name="surname"
								placeholder="Surname"
								value={this.state.surname}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.surname}</span>
						</div>
						<div className={`form-group ${this.errorClass(this.state.formErrors.mail)}`}>
							<input type="email" className="form-control" name="mail"
								placeholder="Mail Adress"
								value={this.state.mail}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.mail}</span>
						</div>
						<div className={`form-group ${this.errorClass(this.state.formErrors.business)}`}>
							<input type="text" className="form-control" name="business"
								placeholder="Business"
								value={this.state.business}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.business}</span>
						</div>
						<div className={`form-group ${this.errorClass(this.state.formErrors.roll)}`}>
							<input type="text" className="form-control" name="roll"
								placeholder="Roll"
								value={this.state.roll}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.roll}</span>
						</div>
						<div className={`form-group ${this.errorClass(this.state.formErrors.password)}`}>
							<input type="password" className="form-control" name="password"
								placeholder="Password"
								value={this.state.password}
								onChange={this.handleUserInput}  />
							<span className="errorClass">{this.state.formErrors.password}</span>
						</div>
						

						<button type="submit" className="btn btn-register-btn" disabled={!this.state.formValid}>
							Create Account <span>→</span>
						</button><br/><br/>

					</form>

					<Link to="/sign-in"  className="link link-header no-border"> <span>LOG IN</span> </Link>

					<br/><br/>
					<span class="link-header-text"> SPARA PROJEKT </span>
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
	
}

Register.defaultProps = {
    action: '/api/post/registration',
    method: 'post'
};
