import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router";
import axios from "axios";

// STYLES //
require("./styles/HeaderStyle.scss");
require("./styles/LinkStyle.scss");

@connect((store)=>{
	return store.user;
})

export default class Header extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			firstname: null,
			lastname: null,
			picURL: null,
		};
	}

	componentWillMount() {

		/*axios.get("/api/get/user").then((response)=> {
			this.setState({
				firstname: response.data.first_name,
				lastname: response.data.last_name,
				picURL: response.data.pic_url,
			});

		}).catch(function(error) {
			console.log(error);
		});*/

	}

	render() {

		const {loggedIn, fetching} = this.props;
		const {pic_url, first_name } = this.props.user;
		return (
    		<nav className="navbar navbar-default navbar-static-top">
				<div className="container">
		    		<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar" />
							<span className="icon-bar" />
							<span className="icon-bar" />
						</button>
						<Link to="/">
							<img src="http://www.entiros.se/sites/all/themes/bootstrap_subtheme/logoText.png" class="logo"/>
						</Link>
					</div>

				    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						{/* <ul class="nav navbar-nav">
							<li><a href="#">About</a></li>
							<li><a href="#">Link</a></li>
						</ul>*/}
						{!loggedIn && !fetching && 
							<ul className="nav navbar-nav navbar-right">
								<li><Link to="/sign-in"  className="link link-header no-border"> <span>LOGGA IN</span> </Link></li>
								<li><Link to="/register" className="link link-header"> <span>REGISTRERA</span> </Link></li>
							</ul>
						}
						{loggedIn && !fetching &&
							<ul className="nav navbar-nav navbar-right">
								<li><a className="link link-header no-border logout" href="/auth/log-out">LOG OUT</a>  </li>
								{pic_url &&
									<li><img className="profile-picture" src={pic_url} alt=""/></li>
								}
								{!pic_url &&
									<li><a className="link link-header no-border logout">{first_name}</a></li>
								}
							</ul>
						}
				    </div>
			  	</div>
			</nav>
		);
	}
}

Header.propTypes = {
	loggedIn: PropTypes.bool,
	fetching: PropTypes.bool,
	user: PropTypes.object,
	pic_url: PropTypes.string,
	first_name: PropTypes.string,
};
