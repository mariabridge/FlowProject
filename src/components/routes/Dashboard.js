import React, { Component } from "react";
import { connect } from "react-redux";
import FlowLayout from "../FlowLayout";
import axios from "axios";
import graphUtils from "../Flow4/utilities.js";
import { browserHistory } from 'react-router'; // In react-router v3 only
import start from "../Flow4/flowClass.js";
//import Background from "../Background";
require("../styles/DashboardStyle.scss");

const iconStyle = {
    fontSize: "54px",
};


@connect((store) => {
    return store;
})
export default class Dashboard extends React.Component {
    // TODO: Get actual amount of flows/systems

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            projects: [],
        };
        this.getProjectDetail = this.getProjectDetail.bind(this);
    }

    componentWillMount() {

        axios.get("/api/get/projects/"+this.props.user.user.id).then((response) => {
            //this.state.projects = response.data;
            this.setState({ projects: response.data });



        }).catch(function(error) {
            console.log(error);
        });
    }

    render() {
        return ( <
            FlowLayout >

            <
            div class = "dashboard col-md-10  col-md-offset-1" >
            <
            h2 className = "faded text-left dashboard-title" > My Projects < /h2> <
            ul class = "dashbox" > {
                this.state.projects.map((project) =>
                    <
                    li key = { project.id } onClick = {
                        () => this.getProjectDetail(project.id) } className = "project_box col-lg-3 col-sm-4 col-xs-12" >
                    <
                    div className = "project_list"
                    style = { { backgroundColor: this.props.settings.bgColor } } >
                    <
                    h5 className = "flow-title" > { project.project_name } < /h5> <
                    p className = "flow-count" > { project.flow_count } { project.flow_count > 1 ? 'Flows' : 'Flow' } < /p> <
                    /div> <
                    /li>
                )
            }

            <
            li onClick = {
                () => this.getProjectDetail('') } className = "project_box col-lg-3 col-sm-4 col-xs-12" >
            <
            div className = "project_list"
            style = { { backgroundColor: this.props.bgColor } } >
            <
            h4 > New Project < img src = "../../assets/images/add-icon.png" / > < /h4> <
            /div> <
            /li>

            <
            /ul> <
            /div> <
            /FlowLayout>
        );
    }

    getProjectDetail(id) {
        if (id) {
            browserHistory.push('/flowhow4/' + id);
        } else {
            browserHistory.push('/flowhow4');
        }

    }
}