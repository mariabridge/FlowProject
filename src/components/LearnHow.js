import React from "react";
import { connect } from "react-redux";

require("./styles/LearnHowStyle.scss");

import ReactTooltip from "react-tooltip";

@connect((store)=>{
	return {
		location: store.routing.locationBeforeTransitions.pathname,
	};
})

export default class LearnHow extends React.Component {
	// TODO: Set title/desc depending on url-location, 
	// Maybe store this desc/title in a json file?

	render() {
		const res = this.setInfo();

		// TODO: Make a custom tooltip

    	return (
			<div>
				<a target="_blank" href={res.url}>
					<div className="info-container">
						<div className="info-box">
							<div data-tip={res.desc} id="info-field" className="shadow">
								<span id="title">LEARN HOW</span>
								<p className="description">
									{res.title}
								</p>
							</div>
							<div className="round shadow" />
						</div>
					</div>

					<ReactTooltip place="top" type="dark" effect="solid"/>
				</a>

			</div>
		);
	}

	setInfo() {

		const res = {
			title: "DEFAULT_TITLE",
			desc: "DEFAULT_DESC",
			url: "http://www.entiros.se/",
		};

		switch (window.location.pathname) {
		case "/flowhow":
		case "/flowhow/beskrivning":
			res.title = "Integrationer";
			res.desc = "Läs mer om integrationer";
			break;
		case "/flowhow/integrationsfloden":
			res.title = "Integrationsflöden";
			res.desc = "Läs mer om integrationsflöden";
			break;
		case "/sign-in":
			res.title = "Spara projekt";
			res.desc = "Läs mer om hur du sparar ditt projekt";
			break;
		case "/flowhow4":
			res.title = "Integrationer";
			res.desc = "Läs mer om integrationer";
			break;
		}

		return res;
	}
}
