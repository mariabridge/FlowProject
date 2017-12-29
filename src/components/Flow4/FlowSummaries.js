import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Summary } from "./Summary";
import { forEach } from "lodash";

import { removeFlow } from "../../actions/flowHowActions";
import { changeHighlighted, changeExpanded } from "../../actions/settingsActions";
import $ from "jquery";

@connect( (store) => {
	return {
		flows: store.flowHow.flows,
		highlighted: store.settings.highlighted,
		expanded: store.settings.expanded,
	};
})

export default class FlowSummaries extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			flows: null,
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			flows: nextProps.flows,
		});
	}

	render() {

		return (
			<div>
				{this.flows()}
    		</div>
    	);
	}

	flows() {
		let flows = this.state.flows;

		if(flows) {
			let temp = [];

			forEach(flows, function(value) {
				temp.push(value);
			});


			return temp.map((data) => {
				return <Summary key={"summary_" + data.title} data={data} removeFlow={this.removeFlow.bind(this)}/>;
		 	});
		}
		return null;
	}
	
	removeFlow(flowTitle) {
		
		if( flowTitle === this.props.highlighted ) {
			this.props.dispatch(changeHighlighted(null));
		}

		if( flowTitle === this.props.expanded ) {
			this.props.dispatch(changeExpanded(null));
		}

		let newFlows = JSON.parse(JSON.stringify(this.state.flows));
		delete newFlows[flowTitle];

		this.props.dispatch(removeFlow(newFlows));

		this.setState({
			flows: newFlows,
		});

		localStorage.setItem("flows", JSON.stringify(newFlows) );
		

		// Remove Popup
		var element = document.getElementById("removeflow_popup")
		element.remove();
	}
}

FlowSummaries.propTypes = {
	flows: PropTypes.object,
	highlighted: PropTypes.string,
	expanded: PropTypes.string,
	dispatch: PropTypes.func,
};
