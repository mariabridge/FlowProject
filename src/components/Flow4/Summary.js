import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { changeHighlighted, changeExpanded } from "../../actions/settingsActions";
import { updateFlows } from "../../actions/flowHowActions";

let _ = require("lodash");

require("../styles/FlowSummaryStyle.scss");

@connect( (store)=>{
	return store.settings;
})

export class Summary extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: "Title",
			description: "Description",
			targets: [],
			flows: [],
			sources: [],
			experiences: [],
			processes: [],
			informations: [],
			expanded: false,
			isHighlighted: false,
		};

	}

	componentWillMount() {
		this.formatData(this.props.data);
	}

	componentWillReceiveProps(nextProps) {
		this.formatData(nextProps.data);

		if(this.state.title === nextProps.highlighted) {
			this.highlightCells();
		} else {
			this.unHighlightCells();
		}

		if(this.state.title === nextProps.expanded) {
			this.expand();
		} else {
			this.unExpand();
		}
	}

	componentDidUpdate() {
		let wrapper = this.refs.contentWrapper;
		let height = this.refs.content.clientHeight;

		let currentHeight = this.state.expanded ? height : 0;

		wrapper.style.height = currentHeight + "px";
	}

	render() {
		const targets = this.state.targets.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)}
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)} 
					className="nodeField" key={"node" + i}> 
					{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>
			);
		});
		const flows = this.state.flows.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)}
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)}  
					className="nodeField" key={"node" + i}> 
					{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>
			);
		});
		const sources = this.state.sources.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)} 
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)} 
					className="nodeField" key={"node" + i}> 
					{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>);
		});
		const experiences = this.state.experiences.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)} 
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)} 
					className="nodeField microflow" key={"node" + i}> 
					<span className="microflow-title">Experience</span> <br/>{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>);
		});
		const processes = this.state.processes.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)} 
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)} 
					className="nodeField microflow" key={"node" + i}> 
					<span className="microflow-title">Process</span> <br/>{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>
			);
		});
		const informations = this.state.informations.map((node, i)=>{
			return (
				<div 
					onClick={() => this.changeNodeName(node)} 
					onMouseEnter = {this.focusCell.bind(this, node)} 
					onMouseLeave = {this.unFocusCell.bind(this, node)} 
					className="nodeField microflow" key={"node" + i}> 
					<span className="microflow-title">Information</span> <br/>{node.value.getAttribute("title")} 
					<div className="remove-cell" onClick={this.removeCell.bind(this, node)} >
						<span>X</span>
					</div>
				</div>);
		});

		const {expanded, height, isHighlighted} = this.state;

		let currentHeight = expanded ? height : 0;

		return (

			<div 
				 ref="flowSummary" 
				className = {`flow-summary ${expanded ? "" : "closed "} ${isHighlighted ? "highlighted " : ""}` }
			 >
				<div className="toggle-expanded" onClick={this.toggleExpand.bind(this)}>
					  <span />
					  <span />
					  <span />
					  <span />
				</div>
				<h3 className="title" onClick={this.changeTitle.bind(this)}>{this.state.title}</h3>
				<img className="highlight-button" src={`./assets/images/highlight-${isHighlighted ? "on.svg" : "off.svg"}`} alt="" onMouseDown={this.toggleHighlightCells.bind(this)}/>
				<div className="summary-content" ref="contentWrapper" style={{height: currentHeight + "px"}} >
					<div className="content-body" ref="content">
						<h5 className="description" onClick={this.changeDesc.bind(this)}>{this.state.description}</h5>
						{targets.length > 0 &&
							<h5 className="field-title">Target Apps</h5>
						}
						{targets}
						{flows.length > 0 &&
							<h5 className="field-title">Information Objects</h5>
						}
						{flows}
						{experiences}
						{processes}
						{informations}
						{sources.length > 0 &&
							<h5 className="field-title">Source Apps</h5>
						}
						{sources}
						<div className="nodeField remove-flow" onClick={()=>{this.props.removeFlow(this.state.title);} }> 
							<span className="microflow-title">Remove flow</span> <br/>
						</div>
					</div>
				</div>
			</div>
		);
	}	


	focusCell(node) {
		let style = node.getStyle();
		style = style.replace(/\ hovered/g, "");

		node.setStyle(style + ";strokeColor=red");
		window.graph.refresh();
	}

	unFocusCell(node) {
		let style = node.getStyle();
		style = style.replace(/\;strokeColor=red/g, "");

		node.setStyle(style);
		window.graph.refresh();
	}

	changeNodeName(node) {
		let newName = prompt("Enter new name", node.value.getAttribute("title")) || node.value.getAttribute("title");
		const edit = new mxCellAttributeChange(node, "title", newName);

		window.graph.getModel().execute(edit);
	}

	removeCell(node, e) {
		e.stopPropagation();

		this.unFocusCell(node);
		let style = node.getStyle();
		style = style.replace(/\;fillColor=rgba\(255, 255, 255, 0.4\)/g, "");

		node.setStyle(style);

		window.graph.refresh();

		
		// Start by removing the cell from the flow in local storage
		let savedFlows = JSON.parse(window.localStorage.flows);
		let thisFlow = savedFlows[this.state.title];
		let thisFlowIDs = thisFlow.nodeIDs;
		let nodeID = node.getId(); 

		thisFlowIDs = _.without(thisFlowIDs, nodeID);		
		thisFlow.nodeIDs = thisFlowIDs;
		
		
		// ... and remove from state
		let nodeType = node.value.nodeName;

		let {targets, flows, sources, experiences, processes, informations, allCells} = this.state;

		allCells = _.filter(this.state.allCells, (cell)=>{return cell.id !== nodeID;});
		this.setState({ allCells: allCells });

		switch (nodeType) {
		case "Target":
			targets = _.filter(this.state.targets, (cell)=>{return cell.id !== nodeID;});
			this.setState({ targets: targets });
			break;
		case "Flow":
			flows = _.filter(this.state.flows, (cell)=>{return cell.id !== nodeID;});
			this.setState({ flows: flows });
			break;
		case "Source":
			sources = _.filter(this.state.sources, (cell)=>{return cell.id !== nodeID;});
			this.setState({ sources: sources });
			break;
		case "Experience": 
			experiences = _.filter(this.state.experiences, (cell)=>{return cell.id !== nodeID;});
			this.setState({ experiences: experiences });
			break;
		case "Process": 
			processes = _.filter(this.state.processes, (cell)=>{return cell.id !== nodeID;});
			this.setState({ processes: processes });
			break;
		case "Information": 
			informations = _.filter(this.state.informations, (cell)=>{return cell.id !== nodeID;});
			this.setState({ informations: informations });
			break;
		}

		// Wait for the setState to finish before dispatching updateFlows
		// otherwise 'updateFlows' will call highLightCells which will highlight the removed cell aswell
		// Ugly, but kinda works..
		setTimeout(()=>{
			this.props.dispatch(updateFlows(savedFlows));
		}, 100);
		

	}

	unHighlightCells() {
		// Unhighligt ALL cells instead in the reducer, here we only change the state
		this.setState({
			isHighlighted: false,
		});
	}
	
	highlightCells() {
		let node;
		let style;

		for(let i = 0; i < this.state.allCells.length; i++) {

			node = this.state.allCells[i];
			// remove inline styling to ensure that it won't add duplicates
			style = node.getStyle();
			style = style.replace(/;fillColor=rgba(255, 255, 255, 0.4)/g, "");

			node.setStyle(style + ";fillColor=rgba(255, 255, 255, 0.4)");
		}

		window.graph.refresh();

		this.setState({
			isHighlighted: true,
		});
	}

	toggleHighlightCells() {

		if(!this.state.isHighlighted) {
			this.props.dispatch(changeHighlighted(this.state.title));
		} else {
			this.props.dispatch(changeHighlighted(null));
		}
	}

	formatData(data) {

		const targets = [];
		const flows = [];
		const sources = [];
		const experiences = [];
		const processes = [];
		const informations = [];
		const allCells = [];
		
		for(let i = 0; i < data.nodeIDs.length; i++) {
			const nodeID = data.nodeIDs[i];
							
			const node = window.graph.model.getCell(nodeID);

			// Node doesn't exist anymore and has probably been removed
			if(!node || !node.value) {
				continue;
			}

			if(!node.edge) {
				if (node.value.nodeName === "Target") {
					targets.push(node);
					allCells.push(node);
				} else if (node.value.nodeName === "Flow") {
					flows.push(node);
					allCells.push(node);
				} else if (node.value.nodeName === "Source") {
					sources.push(node);
					allCells.push(node);
				} else if (node.value.nodeName === "Experience") {
					experiences.push(node);
					allCells.push(node);
				} else if (node.value.nodeName === "Information") {
					informations.push(node);
					allCells.push(node);
				} else if (node.value.nodeName === "Process") {
					processes.push(node);
					allCells.push(node);
				} else {
					console.warn("Undeclared node type: " + node.value.nodeName);
				}
			}
		}

		this.setState({
			title: data.title,
			description: data.description,
			targets: targets,
			flows: flows,
			sources: sources,
			experiences: experiences,
			processes: processes,
			informations: informations,
			allCells: allCells,
		});
		
	}

	toggleExpand() {

		if(!this.state.expanded) {
			this.props.dispatch(changeExpanded(this.state.title));
		} else {
			this.props.dispatch(changeExpanded(null));
		}
	}

	expand() {
		this.setState({
			expanded: true,
			height: this.refs.content.clientHeight,
		});
	}
	unExpand() {
		this.setState({
			expanded: false,
			height: this.refs.content.clientHeight,
		});
	}

	changeTitle() {

		let flows = JSON.parse(window.localStorage.flows);
		let thisFlow = flows[this.state.title];
		let oldTitle = thisFlow.title;

		const newTitle = prompt("New title", this.state.title) || this.state.title;
		thisFlow.title = newTitle;
		this.setState({
			title: newTitle,
		});

		// Remove old flow from 'flows' and add new one
		delete flows[oldTitle];
		flows[newTitle] = thisFlow;
		
		this.props.dispatch(updateFlows(flows));
			
	}
	changeDesc() {
		
		let flows = JSON.parse(window.localStorage.flows);
		let thisFlow = flows[this.state.title];
		const newDesc = prompt("New description", this.state.description) || this.state.description;
		
		this.setState({
			description: newDesc,
		});

		// Update description of current flow
		thisFlow.description = newDesc;

		
		this.props.dispatch(updateFlows(flows));
	}
}

Summary.propTypes = {
	data: PropTypes.object,
	highlighted: PropTypes.string,
	expanded: PropTypes.string,
	removeFlow: PropTypes.func,
	dispatch: PropTypes.func,
};
