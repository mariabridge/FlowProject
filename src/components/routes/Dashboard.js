import React from "react";

import FlowLayout from "../FlowLayout";
import ChangeColor from "../ChangeColor";
import axios from "axios";
import graphUtils from "../Flow4/utilities.js";
import { browserHistory } from 'react-router';// In react-router v3 only
import start from "../Flow4/flowClass.js";

require("../styles/DashboardStyle.scss");

const iconStyle = {
	fontSize: "54px",
};


export default class Dashboard extends React.Component {
	// TODO: Get actual amount of flows/systems
	
	constructor(props) {
		super(props);
		this.state = {
		  value: '',
		  projects :[]
		};
		this.getProjectDetail = this.getProjectDetail.bind(this);
	}
	
	componentWillMount() {
		
		axios.get("/api/get/projects").then((response)=> {
			//this.state.projects = response.data;
			this.setState({ projects:  response.data });

		}).catch(function(error) {
			console.log(error);
		});
	}

	render() {
		return (
    		<FlowLayout>
				<h2 className="faded">My Projects</h2>
				<div class="dashboard">
					<ul>
						{this.state.projects.map((project) => 
							<li key={project.id} onClick={() => this.getProjectDetail(project.id)} className="project_box col-lg-3 col-sm-4 col-xs-12"> 
								<div className="project_list">
									<h5>{project.project_name} </h5>
									<h6>{project.flow_count} Flows </h6>
								</div>
							</li>
						)}

						<li onClick={() => this.getProjectDetail('')} className="project_box col-lg-3 col-sm-4 col-xs-12"> 
							<div className="project_list">
								<h4>New Project <img src="../../assets/images/add-icon.png"/></h4>
							</div>
						</li>

					</ul>
				</div>
  			</FlowLayout>
    	);
	}
	
	getProjectDetail(id){
		if(id){
			browserHistory.push('/flowhow4/'+id);
		}else{
			browserHistory.push('/flowhow4');
		}
		
	}
}
