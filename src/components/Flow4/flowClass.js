const _ = require("lodash");
let boundFitFlag = false;
let scroll_x = 0;
let sourceFlag = 0, targetFlag = 0;

import PropTypes from "prop-types";
import { uniq, forEach, remove, isEmpty } from "lodash";
import { initMxIconSet } from "./mxIconSet.js";
import { styleConstants } from "./constants.js";
import graphUtils from "./utilities.js";
import axios from "axios";
import { updateFlows, FlowPopup } from "../../actions/flowHowActions";

import $ from "jquery";

export default class FlowGraph {
	/**
	 *  Constructor for the FlowGraph 
	 * @param {DOM Element} the target DOM Element that the graph will be mounted into
	 */ 
	constructor(container) {
		// Most browsers are supported though, except IE (obviously..)
		if (!mxClient.isBrowserSupported()) {
			mxUtils.error("Browser is not supported!", 200, false);
			return null;
		}
				
		mxConstants.MIN_HOTSPOT_SIZE = 1;
		mxConstants.DEFAULT_HOTSPOT = 16;

		this.editor = new mxEditor();
		this.graph = this.editor.graph;

		this.graphNodes = [];// For defining nodes
		this.graphEdges = [];// For defining Edges / Connections

		this.graph.view.fullscreen = false;
		
		// Set the graph globaly available
		window.graph = this.graph;
		window.addEventListener("resize",function(){
			if(boundFitFlag){
				const margin = 20;
				const max = 3;

				const bounds = this.graph.getGraphBounds();
				const cw = this.graph.container.clientWidth - margin;
				const ch = this.graph.container.clientHeight - margin;
				const w = bounds.width / this.graph.view.scale;
				const h = bounds.height / this.graph.view.scale;
				const s = Math.min(max, Math.min(cw / w, ch / h));

				this.graph.view.scaleAndTranslate(s, -100, 100);
			}
		});
		document.getElementById("graph_Container").addEventListener("scroll", function () {
			if(!window.graph.view.fullscreen){
				var elmnt = document.getElementById("graph_Container");
				scroll_x = elmnt.scrollLeft;
			}			
		});
		

		window.addEventListener("resize",function(){
			if(boundFitFlag){
				const margin = 20;
				const max = 3;

				const bounds = this.graph.getGraphBounds();
				const cw = this.graph.container.clientWidth - margin;
				const ch = this.graph.container.clientHeight - margin;
				const w = bounds.width / this.graph.view.scale;
				const h = bounds.height / this.graph.view.scale;
				const s = Math.min(max, Math.min(cw / w, ch / h));

				this.graph.view.scaleAndTranslate(s, -100, 100);
			}
		});

		document.getElementById("graph_Container").addEventListener("scroll", function () {
			if(!window.graph.view.fullscreen){
				var elmnt = document.getElementById("graph_Container");
				scroll_x = elmnt.scrollLeft;
			}			
		});

		this.setupNodeTemplates();
		this.setupConnectionRestrictions();

		this.graph.setConnectable(true);
		this.graph.setTooltips(false);
		this.graph.setAllowDanglingEdges(false);

		// Gets the default parent for inserting new cells. This
		// is normally the first child of the root (ie. layer 0).
		this.parent = this.graph.getDefaultParent();

		// Setup layers
		this.microServiceLayer = new mxCell();
		this.microServiceLayer.setId("microServiceLayer");
		this.flowLayer = new mxCell();
		this.flowLayer.setId("flowLayer");

		this.graph.addCell(this.microServiceLayer);
		this.graph.addCell(this.flowLayer);


		this.editor.setGraphContainer(container);
		
		// Shows icons if the mouse is over a cell
		initMxIconSet(this.graph);
		this.setupEditorActions();

		var this_ = this;
		this_.currentvalue;

		// DEBUG: console.log cell on click
		this.graph.addListener(mxEvent.CLICK, function(sender, evt) {

			let titleExistsFlag;
			const cell = evt.getProperty("cell");
			if (cell && cell.getValue()) {
				const checkLabel = typeof(cell.getValue()) === "string";
				if (checkLabel) {
					
					/* Change name on flow/app just by clicking on the text in the box */
					var parent = cell.parent;
					let old_title = parent.getValue().getAttribute('title');
					
					const newTitle = prompt("New title", parent.getAttribute("title", "")) || parent.getAttribute("title", "");
					
					let allCells = window.graph.model.cells;
					for (var key in allCells) {
						var cell_ = allCells[key];

						if( cell_.getAttribute("title") == newTitle ){
							titleExistsFlag = true;
						}
					}

					if((newTitle != old_title) && titleExistsFlag){
						alert("Title already exists, Please try other one!")
					}else{
						const edit = new mxCellAttributeChange(parent, "title", newTitle);
						graph.getModel().execute(edit);
	
						let flows = JSON.parse(window.localStorage.flows);
						for (var key in flows) {

							if( flows[key].title == old_title ){
								let thisFlow = flows[old_title];
								thisFlow.title = newTitle;
								delete flows[old_title];
								flows[newTitle] = thisFlow;
								
								this_.refreshFlows(flows);
							}
						}
					}
				}
			}
		});

		
		/* Cell Moved Event Handler */
		this.graph.addListener(mxEvent.CELLS_MOVED, function( cells, dx, dy, disconnect, constrain, extend ) {
			let flows = JSON.parse(localStorage.flows);
			var xcord = dx.properties.dx;
			var selectedCells = graph.getSelectionCells();
			for(var s=0; s<selectedCells.length; s++){
				if( selectedCells[s].style == "flow" ){
					var flow_title = selectedCells[s].value.getAttribute("title");
					let flow = flows[flow_title];
					var microflows = flow.microflows;
					for( var m=0; m<microflows.length; m++){
						var cell = window.graph.model.getCell(microflows[m]);
						this_.graph.translateCell(cell, xcord, 0, false);
					}
				}else if(selectedCells[s].style == "microflow"){

					var node_type = selectedCells[s].value.nodeName+"MicroFlow";
					cellMoved(node_type);
					
					for(var f in flows){
						for( var mf=0; mf<flows[f].microflows.length; mf++){
							if( selectedCells[s].id == flows[f].microflows[mf]){
								var flow_title = flows[f].title;
								var flow_left = document.getElementById(flow_title).offsetLeft;
								var cell_left = selectedCells[s].geometry.x*0.86;
								var flow_right = (document.getElementById(flow_title).offsetLeft)+(document.getElementById(flow_title).offsetWidth);
								var cell_right = (selectedCells[s].geometry.x*0.86)+(selectedCells[s].geometry.width);
			
								if( (flow_left > cell_left) || (flow_right < cell_right) ){
									this_.graph.translateCell(selectedCells[s], -parseFloat(xcord), 0, false);
								}
							}
						}
					}

					setTimeout(function() {
						/** Removed Flow Background */
						const flow_background = document.getElementsByClassName("background_div");
						
						for(let j = flow_background.length; j >= 0; j--) {
							if(flow_background[j]){
								flow_background[j].remove();
							}
						}
					}, 1000);
				}
			}
		});


		// Add new cell in to the work area
		this.graph.addListener(mxEvent.CELLS_ADDED, function(cells,parent,index,source,target,absolute) {

			this_.currentvalue = parent.properties.cells[0].value ;
			var node_name = parent.properties.cells[0].value.nodeName;
			if(this_.currentvalue == 'Flow'){
				this_.setupRightClickMenu(this_.currentvalue);
			}else if( node_name == 'Experience' || node_name == 'Process' || node_name == 'Information' ){
				/*
				* 	Adds Microflow in to Flow summary
				*/
				var flow_title = $("#selected_flow").find("span").text();
				var thisCell = parent.properties.cells[0];
				var cellID = thisCell.id;

				if(flow_title){
					let flows = JSON.parse(localStorage.flows);
					let flow = flows[flow_title];
					flow.microflows.push(cellID);
					flow.microflows = uniq(flow.microflows);
					localStorage.setItem("flows", JSON.stringify(flows));
					
					this_.setupCellConnect(parent.properties.cells[0], flow_title);

					/*
					* 	IF the Flow coincide with other Flow the Flow will be moved in to Right back
					*/
					$(".background_div").each(function(i, obj) {
						var background_left = obj.offsetLeft/0.86-20;
						var background_width = obj.offsetWidth;
						var background_right = obj.offsetLeft/0.86+background_width;
						var cell_x;

						/* Find Flows which is positioned in the right of the selected Flow */
						var selected_left = document.getElementById("selected_flow").offsetLeft/0.86-20 ;
						var selected_right = (document.getElementById("selected_flow").offsetLeft/0.86) + (document.getElementById("selected_flow").offsetWidth) ;
						
						if(obj.id != "selected_flow"){
							
							if( selected_left > background_left ){
								//alert("Left")
								if((selected_left-100) < background_right){
									let allCells = window.graph.model.cells;
									for (var key in allCells) {
										var cell_ = allCells[key];
										if( cell_.getAttribute("title") == flow_title ){
											cell_x = 200;
											this_.graph.translateCell (cell_, cell_x, 0, false);
											let flow_data = flows[flow_title];
											var microflows = flow_data.microflows;
											for( var m=0; m<microflows.length; m++){
												var cell = window.graph.model.getCell(microflows[m]);
												this_.graph.translateCell (cell, cell_x, 0, false);
											}

										}
									}
								}
							}else{
								//alert("Right")
								if((selected_right+100) > background_left || ( selected_left < 0 )){
									let allCells = window.graph.model.cells;

									if( selected_left-100 > 0 ){
										cell_x = -200 ;
									}else{
										cell_x = 200 ;
										if((selected_right+100) > background_left){
											flow_title = $(obj).find("span").text();
										}
									}
																	
									for (var key in allCells) {
										var cell_ = allCells[key];
										if( cell_.getAttribute("title") == flow_title ){
											this_.graph.translateCell (cell_, cell_x, 0, false);
											let flow_data = flows[flow_title];
											var microflows = flow_data.microflows;
											for( var m=0; m<microflows.length; m++){
												var cell = window.graph.model.getCell(microflows[m]);
												this_.graph.translateCell (cell, cell_x, 0, false);
											}
										}
									}

								}
							}

						}

					});
				}
			}

		});

		
		// Add new connection with the cells
		this.graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt){
			
			//alert("Connect");
			var edge = evt.getProperty('cell');
			var source = graph.getModel().getTerminal(edge, true);
			var target = graph.getModel().getTerminal(edge, false);
			var flow_title ;

			if(source.style != 'flow'){
				flow_title = target.value.getAttribute("title")
			}else{
				flow_title = source.value.getAttribute("title")
			}

			/* If any one of the cell target or source become Microflow */
			if((source.style != "microflow" && target.style == "microflow") || (source.style == "microflow" && target.style != "microflow")){
				// Add Micro flow Target/Source adds in to Flow Summary
				let flows = JSON.parse(localStorage.flows);
				for(var i in flows){

					var value = flows[i].nodeIDs.indexOf(target.id);
					if(value != -1 || value != "-1"){
						flow_title = flows[i].title;
						this_.setupCellConnect(source, flow_title);
					}

					var value = flows[i].nodeIDs.indexOf(source.id);
					if(value != -1 || value != "-1"){
						flow_title = flows[i].title;
						this_.setupCellConnect(target, flow_title);
					}
				}
			}else if((source.style != "microflow") && (target.style != "microflow")){
				this_.setupCellConnect(source, flow_title);
				this_.setupCellConnect(target, flow_title);
			}


			/*
			*	Cell Connection Checking --------- 
			*	
			*/

			if(source.style == "target"){
				if(target.style == "microflow"){
					//alert("Connect with Microflow")
					let allCells = window.graph.model.cells;
					let source1, target1 ;
					for (var key in allCells) {
						var cell_ = allCells[key];
						if( cell_.getAttribute("title") == flow_title ){
		
							if(source.style != "microflow"){
								
								source1 = source ;
								target1 = cell_;
		
							}else{
								
								source1 = cell_ ;
								target1 = target;
		
							}
						}
					}

					if(target1.getEdgeCount() !=0 ){
						
						for (var i = 0; i < target1.getEdgeCount(); i++) {
							var source_ =  (target1.getEdgeAt(i)).source;
							var target_ =  (target1.getEdgeAt(i)).target;
			
							if (source_ == target1 || target_ == target1){
								// Cells Already connected...........
								console.log (true);
							}
							else{
								window.graph.connectionHandler.connect( source, target1 );
							}
						}
					}else{

						window.graph.connectionHandler.connect( source, target1 );
					}


				}else{
					//alert("Connect with Flow")
					let flows = JSON.parse(window.localStorage.flows);
					let flow = flows[flow_title];
					let micro_flows = flow.microflows;
					for(var m=0; m<micro_flows.length; m++){
						var cell = window.graph.model.getCell(micro_flows[m]);
	
						if(cell.value.nodeName == "Experience"){

							if(cell.getEdgeCount() !=0 ){
								
								for (var i = 0; i < cell.getEdgeCount(); i++) {
									var source_ =  (cell.getEdgeAt(i)).source;
									var target_ =  (cell.getEdgeAt(i)).target;
									if (source_ == source || target_ == cell){
										// Cells Already connected...........
										console.log (true);
									}
									else{
										window.graph.connectionHandler.connect( source, cell );
									}
								}
							}else{

								window.graph.connectionHandler.connect( source, cell );
							}

						}
					}					
				}
			}if(target.style == "target"){
				if(source.style == "microflow"){
					//alert("MF connected with Target")
					let allCells = window.graph.model.cells;
					let source1, target1 ;
					for (var key in allCells) {
						var cell_ = allCells[key];
						if( cell_.getAttribute("title") == flow_title ){
		
							if(source.style != "microflow"){
								
								source1 = source ;
								target1 = cell_;
		
							}else{
								
								source1 = cell_ ;
								target1 = target;
		
							}
						}
					}

					if(source1.getEdgeCount() !=0 ){
						
						for (var i = 0; i < source1.getEdgeCount(); i++) {
							var source_ =  (source1.getEdgeAt(i)).source;
							var target_ =  (source1.getEdgeAt(i)).target;
			
							if (source_ == source1 || target_ == source1){
								// Cells Already connected...........
								console.log (true);
							}
							else{
								window.graph.connectionHandler.connect( source1, target1 );
							}
						}
					}else{

						window.graph.connectionHandler.connect( source1, target1 );
					}
				}
				else{
					alert("F connected with Target")
					let flows = JSON.parse(window.localStorage.flows);
					let flow = flows[flow_title];
					let micro_flows = flow.microflows;
					for(var m=0; m<micro_flows.length; m++){
						var cell = window.graph.model.getCell(micro_flows[m]);
	
						if(cell.value.nodeName == "Experience"){

							if(cell.getEdgeCount() !=0 ){
								for (var i = 0; i < cell.getEdgeCount(); i++) {
									var source_ =  (cell.getEdgeAt(i)).source;
									var target_ =  (cell.getEdgeAt(i)).target;
					
									
									if ((source_ == cell || target_ == cell) && target_.style != "microflow"){
										// Cells Already connected...........
										
										console.log (true);
									}
									else{
										window.graph.connectionHandler.connect( target, cell );
										return;
									}
								}
							}else{

								window.graph.connectionHandler.connect( target, cell );
							}

						}
					}	
				}
			}
			if(source.style == "microflow" && target.style == "microflow"){
				return;
			}
			else if(target.style == "source"){
				if(source.style == "microflow"){
					//alert("MF connected with Source")
					let allCells = window.graph.model.cells;
					let source1, target1 ;
					for (var key in allCells) {
						var cell_ = allCells[key];
						if( cell_.getAttribute("title") == flow_title ){
		
							if(source.style != "microflow"){
								
								source1 = source ;
								target1 = cell_;
		
							}else{
								
								source1 = cell_ ;
								target1 = target;
		
							}
						}
					}

					if(source1.getEdgeCount() !=0 ){
						
						for (var i = 0; i < source1.getEdgeCount(); i++) {
							var source_ =  (source1.getEdgeAt(i)).source;
							var target_ =  (source1.getEdgeAt(i)).target;

							if (source_ == source1 || target_ == source1){
								// Cells Already connected...........
								console.log (true);
							}
							else{
								window.graph.connectionHandler.connect( source1, target1 );
							}
						}
					}else{

						window.graph.connectionHandler.connect( source1, target1 );
					}
				}else{
					//alert("F connected with Source")
					let flows = JSON.parse(window.localStorage.flows);
					let flow = flows[flow_title];
					let micro_flows = flow.microflows;
					for(var m=0; m<micro_flows.length; m++){
						var cell = window.graph.model.getCell(micro_flows[m]);

						if(cell.value.nodeName == "Information"){
							if(cell.getEdgeCount() !=0 ){
								
								for (var i = 0; i < cell.getEdgeCount(); i++) {
									var source_ =  (cell.getEdgeAt(i)).source;
									var target_ =  (cell.getEdgeAt(i)).target;
																		
									if (source_ == cell || target_ == cell){
										// Cells Already connected...........
										console.log (true);
										if(target_ == cell){
											window.graph.connectionHandler.connect( cell, target );
										}
									}
									else{
										window.graph.connectionHandler.connect( target, cell );
									}
								}
							}else{

								window.graph.connectionHandler.connect( target, cell );
							}
						}
					}
				}
			}
			else if(source.style == "source"){
				if(target.style == "microflow"){
					//alert("Source connected with MF")
					let allCells = window.graph.model.cells;
					let source1, target1 ;
					for (var key in allCells) {
						var cell_ = allCells[key];
						if( cell_.getAttribute("title") == flow_title ){
		
							if(source.style != "microflow"){
								
								source1 = source ;
								target1 = cell_;
		
							}else{
								
								source1 = cell_ ;
								target1 = target;
		
							}
						}
					}

					if(target1.getEdgeCount() !=0 ){
						
						for (var i = 0; i < target1.getEdgeCount(); i++) {
							var source_ =  (target1.getEdgeAt(i)).source;
							var target_ =  (target1.getEdgeAt(i)).target;
			
							if (source_ == target1 || target_ == target1){
								// Cells Already connected...........
								console.log (true);
							}
							else{
								window.graph.connectionHandler.connect( source1, target1 );
							}
						}
					}else{

						window.graph.connectionHandler.connect( source1, target1 );
					}
				}else{
					//alert("Source connected with Flow")
					let flows = JSON.parse(window.localStorage.flows);
					let flow = flows[flow_title];
					let micro_flows = flow.microflows;
					for(var m=0; m<micro_flows.length; m++){
						var cell = window.graph.model.getCell(micro_flows[m]);

						if(cell.value.nodeName == "Information"){

							if(cell.getEdgeCount() !=0 ){
								
								for (var i = 0; i < cell.getEdgeCount(); i++) {
									var source_ =  (cell.getEdgeAt(i)).source;
									var target_ =  (cell.getEdgeAt(i)).target;

									//console.log(cell)
									//console.log(source_)
									//console.log(target_)
									//console.log(source_.style)

									if ((source_ == cell || target_ == cell) ){
										// Cells Already connected...........
										console.log (true);
										/*if(source_.style != "microflow"){
											window.graph.connectionHandler.connect( cell, source );
											return
										}*/
									}
									else{
										window.graph.connectionHandler.connect( target, cell );
										
									}
								}
							}else{

								window.graph.connectionHandler.connect( target, cell );
							}
						}
					}

					
				}
			}

			/*
			*	Ends --------- 
			*	
			*/
			
		});


		
		// When we remove the Flow it will remove the entire flow summary
		this.graph.addListener(mxEvent.CELLS_REMOVED, function(sender,evt) {

			sourceFlag = 0;
			targetFlag = 0;
			
			this_.refreshFlows();

			//console.log(evt.properties.cells[0].id)

			var cell = evt.properties.cells[0];

			/*if(cell.getEdgeCount() !=0 ){
				for (var i = 0; i < cell.getEdgeCount(); i++) {
					var source_ =  (cell.getEdgeAt(i)).source;
					var target_ =  (cell.getEdgeAt(i)).target;
	
					if (source_ == cell || target_ == cell){
						// Cells Already connected...........
						console.log (true);
					}
					else{
						console.log(false)
					}
				}
			}


				
				if(evt.properties.cells[0].value){
					var flow_title = evt.properties.cells[0].value.getAttribute("title");
					
					let newFlows = JSON.parse(window.localStorage.flows);
					delete newFlows[flow_title];
		
					this_.refreshFlows(newFlows);
		
					localStorage.setItem("flows", JSON.stringify(newFlows) );
				}
			*/
		});

		this.setupRightClickMenu('');
		this.setupListener();
		
	}

	/**
	 * Sets up the configuration for the editor
	 * @param {String} configPath 
	 */
	setupConfig(configPath) {
		const config = mxUtils.load(configPath).getDocumentElement();
		this.editor.configure(config);
	}

	/**
	 * Sets up connection restriction between different node types
	 */
	setupConnectionRestrictions() {
		// Setup connection restrictions
		this.graph.multiplicities.push(new mxMultiplicity(true, "Target", "nodeName", null, null, null, ["Flow", "Experience"], "", "Target Must Connect to Flow"));
		this.graph.multiplicities.push(new mxMultiplicity(true, "Experience", "nodeName", null, null, null, ["Target", "Process"], "", "Experience Must Connect to Target"));
		this.graph.multiplicities.push(new mxMultiplicity(true, "Process", "nodeName", null, null, null, ["Experience", "Information"], "", "Experience Must Connect to Target"));
		this.graph.multiplicities.push(new mxMultiplicity(true, "Source", "nodeName", null, null, null, ["Flow", "Information"], "", "Source Must Connect to Flow"));

	}

	/**
	 * Sets the function te be called when the state of the graph updates
	 * @param {Function} funct 
	 */
	onUpdateCall(funct) {
		this.onUpdate = funct;
	}

	/**
	 * Sets the function te be called when the a flow is created
	 * @param {Function} funct 
	 */
	onCreateFlowCall(funct) {
		this.onCreateFlow = funct;
	}

	/**
	 * Sets the function te be called when the graph is refreshed
	 * @param {Function} funct 
	 */
	onRefreshCall(funct) {
		this.refreshFlows = funct;
	}

	/**
	 * Sets up actions and events 
	 */
	setupEditorActions() {
		/**
		 * DEBUG: logs the graph model to the console
		 */
		this.editor.addAction("export", function() {
			const enc = new mxCodec(mxUtils.createXmlDocument());
			const node = enc.encode(graph.getModel());
			console.log(mxUtils.getPrettyXml(node));

		});

		/**
		 * Creates a flow from selected cells
		 */
		this.editor.addAction("groupFlow", () => {
			let title;
			if(this.currentvalue == 'Flow'){
				title = this.currentvalue;
			}else{
				title = prompt("Enter flow name:");
			}

			let flows = {};

			if(window.localStorage.flows) {
				flows = JSON.parse(window.localStorage.flows);	
			}

			const newFlow = {};

			
			if(!title) {
				alert("Please provide a flowname!");
				return;
			}

			if(flows[title]) {
				const flow_length = Object.keys(JSON.parse(window.localStorage.flows)).length ;
				title = this.currentvalue + " " + flow_length;

				var cell = graph.getSelectionCell();
				const edit = new mxCellAttributeChange(cell, "title", title);
				graph.getModel().execute(edit);

				//alert("Title already in use");
				//return;
			}

			newFlow.title = title;
			newFlow.description = "Default description";
			newFlow.nodeIDs = [];
			newFlow.microflows = [];

			if(!this.graph.flows) {
				this.graph.flows = [];
			}

			const selCells = this.graph.getSelectionCells();

			for(let i = 0; i < selCells.length; i++) {
				const cell = selCells[i];
				if(!cell.edge) {
					newFlow.nodeIDs.push(cell.getId());
				}
			}

			flows[title] = newFlow;

			localStorage.setItem("flows", JSON.stringify(flows) );
			
			this.refreshFlows();
			
		});

		/**
		 * Toggle microflow/flow layer visible
		 */
		this.editor.addAction("toggleMicroFlow", function() {
			graphUtils.toggleFlowMicroLayers(this.graph);
		});

		/**
		 * Fits the entire graph in view
		 */
		this.editor.addAction("fit", function() {
			boundFitFlag = true;
			const margin = 10;
			const max = 3;

			const bounds = this.graph.getGraphBounds();
			const cw = this.graph.container.clientWidth - margin;
			const ch = this.graph.container.clientHeight - margin;
			const w = bounds.width / this.graph.view.scale;
			const h = bounds.height / this.graph.view.scale;
			const s = Math.min(max, Math.min(cw / w, ch / h));

			this.graph.view.scaleAndTranslate(s,
				(margin + cw - w * s) / (2 * s) - bounds.x / this.graph.view.scale,
				(margin + ch - h * s) / (2 * s) - bounds.y / this.graph.view.scale);
			/*this.graph.view.scaleAndTranslate(s, -100, 100);*/
			
		});	

		/**
		 * Toggles between fullscreen mode and regular mode
		 */
		this.toggleFullScreen = (isFullScreen) => {
			
			if(isFullScreen !== undefined) {
				this.graph.view.fullscreen = isFullScreen;				
			} else {
				this.graph.view.fullscreen = !this.graph.view.fullscreen || false;
			}

			// Zoomed in mode
			if(!this.graph.view.fullscreen) {
				
				let cssBorder = this.graph.getBorderSizes();
				let s = this.graph.view.scale;

				let h1 = this.graph.container.offsetHeight - cssBorder.y - cssBorder.height - 1;
				const h2 = 8 * styleConstants.cell.height;
				
				const s2 = h1 / h2;

				this.graph.view.scaleAndTranslate(s2, 0, 0);
				document.getElementById("graph_Container").scrollLeft = parseInt(scroll_x);
				document.getElementById("swimlanes").style.display = null;
				
				
				
			// Full screen mode
			} else {
				document.getElementById("swimlanes").style.display = "none";
				this.editor.execute("fit");
			}
		};

		this.editor.addAction("toggleFullScreen", () => {
			this.toggleFullScreen();
		}); 
	}
	/**
	 * Sets up new connection with the flows, Automatically created flow summary
	 */
	setupCellConnect(source, title) {
		let flows = JSON.parse(localStorage.flows);
		//forEach(flows, function(value, key) {
			const selectedCells = source;
			let flow = flows[title];
			let cellID = selectedCells.getId();
			flow.nodeIDs.push(cellID);
			flow.nodeIDs = uniq(flow.nodeIDs);
			localStorage.setItem("flows", JSON.stringify(flows));
			
			this.refreshFlows();
		//});
	}

	/**
	 * Sets up the UI
	 * @param {DOM Element} sidebarContainer 
	 * @param {DOM Element} toolbarContainer 
	 */
	setupUI(sidebarContainer, toolbarContainer) {
		graphUtils.configureStylesheet(this.graph);

		// Add drag buttons to the sidebar
		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.targetNode);
		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.flowNode);

		// MicroFlows
		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.expMicroNode);
		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.procMicroNode);
		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.infoMicroNode);

		graphUtils.addSidebarIcon(this.graph, sidebarContainer, this.sourceNode);


		// Setup toolbar
		const spacer = document.createElement("div");
		spacer.style.display = "inline";
		spacer.style.padding = "8px";
		
		graphUtils.addToolbarButton(this.editor, toolbarContainer, "toggleMicroFlow", "", "../../assets/images/eye.svg", true);
		graphUtils.addToolbarButton(this.editor, toolbarContainer, "toggleFullScreen", "", "../../assets/images/zoom-to-fit.svg", true );
		//graphUtils.addToolbarButton(this.editor, toolbarContainer, 'fit', '', './assets/images/zoom-to-fit.svg', true );
		//graphUtils.addToolbarButton(this.editor, toolbarContainer, 'zoomOut', '', './assets/images/zoom-out.svg', true );
		//graphUtils.addToolbarButton(this.editor, toolbarContainer, 'zoomIn', '', './assets/images/zoom-in.svg', true );
	}

	/**
	 * Creates node templates in XML format. These node templates are used
	 * when inserting a new cell to the graph
	 */
	setupNodeTemplates() {

		const xmlDocument = mxUtils.createXmlDocument();
		this.targetNode = xmlDocument.createElement("Target");
		this.flowNode = xmlDocument.createElement("Flow");
		this.sourceNode = xmlDocument.createElement("Source");
		this.expMicroNode = xmlDocument.createElement("Experience");
		this.procMicroNode = xmlDocument.createElement("Process");
		this.infoMicroNode = xmlDocument.createElement("Information");
		
		this.targetNode.setAttribute("nodeType", "App");
		this.targetNode.setAttribute("title", "Target");
		
		this.flowNode.setAttribute("nodeType", "Information");
		this.flowNode.setAttribute("title", "Flow");

		this.sourceNode.setAttribute("nodeType", "App");
		this.sourceNode.setAttribute("title", "Source");

		// MicroFlows
		this.expMicroNode.setAttribute("nodeType", "MicroFlow");
		this.expMicroNode.setAttribute("title", "MicroFlow");

		this.procMicroNode.setAttribute("nodeType", "MicroFlow");
		this.procMicroNode.setAttribute("title", "MicroFlow");

		this.infoMicroNode.setAttribute("nodeType", "MicroFlow");
		this.infoMicroNode.setAttribute("title", "MicroFlow");

		


		/*this.targetNode.setAttribute("x", "218");
		this.targetNode.setAttribute("y", "6");
		this.targetNode.setAttribute("style", "target");
		this.targetNode.setAttribute("id", "1");
		this.targetNode.setAttribute("endPoints", [2,4]);

		this.flowNode.setAttribute("x", "218");
		this.flowNode.setAttribute("y", "306");
		this.flowNode.setAttribute("style", "flow");
		this.flowNode.setAttribute("id", "2");
		this.flowNode.setAttribute("endPoints", [3]);
		
		this.sourceNode.setAttribute("x", "100");
		this.sourceNode.setAttribute("y", "573");
		this.sourceNode.setAttribute("style", "source");
		this.sourceNode.setAttribute("id", "3");
		this.sourceNode.setAttribute("endPoints", []);

		// MicroFlows
		this.expMicroNode.setAttribute("x", "218");
		this.expMicroNode.setAttribute("y", "164");
		this.expMicroNode.setAttribute("style", "microflow");
		this.expMicroNode.setAttribute("id", "4");
		this.expMicroNode.setAttribute("endPoints", [5]);
		
		this.procMicroNode.setAttribute("x", "218");
		this.procMicroNode.setAttribute("y", "295");
		this.procMicroNode.setAttribute("style", "microflow");
		this.procMicroNode.setAttribute("id", "5");
		this.procMicroNode.setAttribute("endPoints", [6]);
		
		this.infoMicroNode.setAttribute("x", "218");
		this.infoMicroNode.setAttribute("y", "428");
		this.infoMicroNode.setAttribute("style", "microflow");
		this.infoMicroNode.setAttribute("id", "6");
		this.infoMicroNode.setAttribute("endPoints", [3]);


		********Extra styles for graph creation End********* */

		//this.graphNodes.push(this.targetNode);
		//this.graphNodes.push(this.flowNode);
		//this.graphNodes.push(this.sourceNode);
		//this.graphNodes.push(this.expMicroNode);
		//this.graphNodes.push(this.procMicroNode);
		//this.graphNodes.push(this.infoMicroNode);
	}

	
	/**
	 * Sets up the menu which displays on right click of a cell
	 */
	setupRightClickMenu(currentvalue) {
		// setup right click menu
		mxPopupMenu.prototype.autoExpand = true;
		//let that = this;
		if(currentvalue == 'Flow'){
			setTimeout(()=>{
				this.currentvalue = currentvalue;
				this.editor.execute("groupFlow");
			}, 100);	
		}
		
		/*this.graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
			if (cell !== null && localStorage.flows) {
				let flows = JSON.parse(localStorage.flows);
				
				menu.addItem("Create flow", null, ()=>{
					this.editor.execute("groupFlow");
				});
				

				if( !isEmpty(flows) ) {
					
					menu.addSeparator();

					const submenu1 = menu.addItem("Add to flow", null, null);
					forEach(flows, function(value, key) {
						
						menu.addItem(value.title, null, function() {
							const selectedCells = graph.getSelectionCells();
							let flow = flows[value.title];
							for(let i = 0; i < selectedCells.length; i++ ) {
								let cellID = selectedCells[i].getId();
								flow.nodeIDs.push(cellID);
							}

							flow.nodeIDs = uniq(flow.nodeIDs);
							localStorage.setItem("flows", JSON.stringify(flows) );
							
							that.refreshFlows();

						}, submenu1);
					});
				}
			}
		};*/
	}

	/**
	 * Event listener that fires when the state of the graph updates
	 */
	setupListener() {
		// Installs automatic validation 
		const listener = ()=> {
			
			const enc = new mxCodec(mxUtils.createXmlDocument());
			const node = enc.encode(this.editor.graph.getModel());
			const data = mxUtils.getPrettyXml(node);

			// Update local storage
			localStorage.setItem("graphData", data);

			let that = this;

			if (localStorage.flows) {
				const flows = JSON.parse(localStorage.flows);
				
				forEach(flows, function(value, key) {	
                    
					// Are there any nodes in the flow?
					if (!value.nodeIDs.length) {
						delete flows[key];
					} else {
						value.nodeIDs = remove(value.nodeIDs, function(id) {
							return that.graph.model.getCell(id);
						});
						value.microflows = remove(value.microflows, function(id) {
							return that.graph.model.getCell(id);
						});
						
					}
				});

				localStorage.setItem("flows", JSON.stringify(flows) );
			}


			// Calls the onUpdate function supplied as argument.

			this.onUpdate(node);

			this.graph.validateGraph();
		};

		this.graph.getModel().addListener(mxEvent.CHANGE, listener);
	}
	
	/**
	 * Reads the data and renders it to the screen.
	 * Also initializes view mode.
	 */
	start(id) {
		if(!id)
		{
			localStorage.clear();
		}
		this.graph.getModel().beginUpdate();
		try {

			this.graphData = {};
			let that = this;
			
			/*
			*	API Call for getting Integration Flow in the selected Project
			*/
			axios.get('/api/get/project/'+id).then(function(response){
				
				

				const xmlDocument = mxUtils.createXmlDocument();

				var parent_ = response.data.flow;
				for( var s=0; s<parent_.length; s++ ){
					var cell_type = parent_[s].type;
					if(cell_type == "flow"){
						
						that.flowNode = xmlDocument.createElement("Flow");
						that.flowNode.setAttribute("nodeType", "Information");
						that.flowNode.setAttribute("title", parent_[s].int_name);
						that.flowNode.setAttribute("x", parent_[s].int_posX);
						that.flowNode.setAttribute("y", parent_[s].int_posY);
						that.flowNode.setAttribute("style", parent_[s].int_style);
						that.flowNode.setAttribute("id", parent_[s].int_cell_id);
						that.flowNode.setAttribute("endPoints", parent_[s].int_endpoints);

					}

					
					that.graphNodes.push(that.flowNode);
				}
				
				var child = response.data.childCells;

				for( var f=0; f<child.length; f++ ){
					var cell_type = child[f].mf_style;
					if(child[f].mf_style == "target"){
						
						that.targetNode = xmlDocument.createElement("Target");
						that.targetNode.setAttribute("nodeType", "App");
						that.targetNode.setAttribute("title", child[f].mf_name);
						that.targetNode.setAttribute("x", child[f].mf_posX);
						that.targetNode.setAttribute("y", child[f].mf_posY);
						that.targetNode.setAttribute("style", child[f].mf_style);
						that.targetNode.setAttribute("id", child[f].mf_cell_id);
						that.targetNode.setAttribute("endPoints", child[f].mf_endpoints);

						that.graphNodes.push(that.targetNode);
												
					}
					else if(child[f].mf_style == "source"){

						that.sourceNode = xmlDocument.createElement("Source");
						that.sourceNode.setAttribute("nodeType", "App");
						that.sourceNode.setAttribute("title", child[f].mf_name);
						that.sourceNode.setAttribute("x", child[f].mf_posX);
						that.sourceNode.setAttribute("y", child[f].mf_posY);
						that.sourceNode.setAttribute("style", child[f].mf_style);
						that.sourceNode.setAttribute("id", child[f].mf_cell_id);
						that.sourceNode.setAttribute("endPoints", child[f].mf_endpoints);

						that.graphNodes.push(that.sourceNode);
												
					}
					else if(child[f].mf_style == "microflow"){
						if(child[f].mf_type == "Experience"){
							
							that.expMicroNode = xmlDocument.createElement("Experience");
							that.expMicroNode.setAttribute("nodeType", "MicroFlow");
							that.expMicroNode.setAttribute("title", "MicroFlow");
							that.expMicroNode.setAttribute("x", child[f].mf_posX);
							that.expMicroNode.setAttribute("y", child[f].mf_posY);
							that.expMicroNode.setAttribute("style", child[f].mf_style);
							that.expMicroNode.setAttribute("id", child[f].mf_cell_id);
							that.expMicroNode.setAttribute("endPoints", child[f].mf_endpoints);

							that.graphNodes.push(that.expMicroNode);
						
						}else if(child[f].mf_type == "Process"){

							that.procMicroNode = xmlDocument.createElement("Process");
							that.procMicroNode.setAttribute("nodeType", "MicroFlow");
							that.procMicroNode.setAttribute("title", child[f].mf_name);
							that.procMicroNode.setAttribute("x", child[f].mf_posX);
							that.procMicroNode.setAttribute("y", child[f].mf_posY);
							that.procMicroNode.setAttribute("style", child[f].mf_style);
							that.procMicroNode.setAttribute("id", child[f].mf_cell_id);
							that.procMicroNode.setAttribute("endPoints", child[f].mf_endpoints);

							that.graphNodes.push(that.procMicroNode);
							
						}else{
							
							that.infoMicroNode = xmlDocument.createElement("Information");
							that.infoMicroNode.setAttribute("nodeType", "MicroFlow");
							that.infoMicroNode.setAttribute("title", child[f].mf_name);
							that.infoMicroNode.setAttribute("x", child[f].mf_posX);
							that.infoMicroNode.setAttribute("y", child[f].mf_posY);
							that.infoMicroNode.setAttribute("style", child[f].mf_style);
							that.infoMicroNode.setAttribute("id", child[f].mf_cell_id);
							that.infoMicroNode.setAttribute("endPoints", child[f].mf_endpoints);

							that.graphNodes.push(that.infoMicroNode);
							
						}
					}				
				}
				
				graphUtils.buildFlowGraph(that.graph,that.graphNodes);

			}).catch(function(error){
				//Some error occurred
			});



			//graphUtils.buildFlowGraph(this.graph,this.graphNodes);

			/*if (localStorage.graphData) {
				graphUtils.readFromLocalstorage(this.graph);
			} else {
				// If no saved graph in localStorage, initialize the default graph
				graphUtils.read(this.graph, "./assets/xml/defaultGraph.xml");
			}*/
		} finally {

			// Updates the display
			this.graph.getModel().endUpdate();

			const showFlowLayer = window.localStorage.showFlowLayer || "true";
			localStorage.setItem("showFlowLayer", showFlowLayer);

			if(!localStorage.flows) {
				localStorage.setItem( "flows", JSON.stringify({}) );
			}

			if(showFlowLayer === "true") {
				graphUtils.toggleFlowMicroLayers(this.graph, true);	
			} else {
				graphUtils.toggleFlowMicroLayers(this.graph, false);	
			}
			
		}

	/**** Key handler Delete & Backspace key handling*/
		var keyHandler = new mxKeyHandler(this.graph);
		keyHandler.bindKey(46, function(evt)
		{
			var selectedCells = window.graph.getSelectionCells();
			for(var s=0; s<selectedCells.length; s++){
				if( selectedCells[s].style == "flow" && window.summaryClass ){
					var flow_title = selectedCells[s].value.getAttribute("title");
					FlowPopup(flow_title, window.summaryClass);
				}else if(selectedCells[s].style == "microflow" || selectedCells[s].style == "target" || selectedCells[s].style == "source" || selectedCells[s].value == "" ){
					if (window.graph.isEnabled())
					{
						 window.graph.removeCells([selectedCells[s]]);
					}
				}else{
					window.graph.removeCells([selectedCells[s]]);
				}
			}
		});

		keyHandler.bindKey(8, function(evt)
		{
			var selectedCells = window.graph.getSelectionCells();
			for(var s=0; s<selectedCells.length; s++){
				if( selectedCells[s].style == "flow" && window.summaryClass ){
					var flow_title = selectedCells[s].value.getAttribute("title");
					FlowPopup(flow_title, window.summaryClass);
				}else if(selectedCells[s].style == "microflow" || selectedCells[s].style == "target" || selectedCells[s].style == "source" || selectedCells[s].value == ""){
					if (window.graph.isEnabled())
					{
					  window.graph.removeCells([selectedCells[s]]);
					}
				}else{
					window.graph.removeCells([selectedCells[s]]);
				}
			}
		});
	/***** END */

		this.toggleFullScreen(false);
		
	}
}

FlowGraph.propTypes = {
	dispatch: PropTypes.func,
};


/**
	@OVERRIDES
*/

// Disable folding/unfolding of cells
mxGraph.prototype.isCellFoldable = function() {
	return false;
};

// Disable resizing of cells
mxGraph.prototype.isCellFoldable.isCellResizable = function() {
	return false;
};

// Change name on dblclick
mxGraph.prototype.dblClick = function(evt, cell) {
	// Do not fire a DOUBLE_CLICK event here as mxEditor will
	// consume the event and start the in-place editor.
/*    
	if (this.isEnabled() && !mxEvent.isConsumed(evt) && cell && this.isCellEditable(cell)) {

		if ( !this.model.isEdge(cell) ) {
			graph.getModel().beginUpdate();

			try {
				// Might wanna change the prompt to a nicer input
				const newTitle = prompt("New title", cell.getAttribute("title", "")) || cell.getAttribute("title", "");
				const edit = new mxCellAttributeChange(cell, "title", newTitle);

				graph.getModel().execute(edit);
			} finally {
				graph.getModel().endUpdate();
			}
		}
	}
*/
	// Disables any default behaviour for the double click
	mxEvent.consume(evt);
};

// Sets the label to the title attribute provided by the node
mxGraph.prototype.convertValueToString = function(cell) {

	if (mxUtils.isNode(cell.value) && !cell.edge) {
		const nodeType = cell.getAttribute("nodeType", "");

		if (nodeType) {
			// Special case for MicroFlows since they have a different structure
			if (nodeType === "MicroFlow") {
				return cell.getValue().nodeName;
			}

			// Something went wrong..
			return nodeType || "Whoops";
		}

		console.warn("Undefined node type: ", cell.value.nodeName);

		// Else if it is a child (label), i.e the 2nd title of the cell
	} else if (!cell.edge && mxUtils.isNode(cell.parent.value)) {
		const title = cell.parent.getAttribute("title", "");
		return title;
	} else if (cell.edge) {
		return "";
	}

	return "UNDEFINED";
};
mxGraph.prototype.retunLabel = function(cell) {
	const label = (this.labelsVisible) ? this.convertValueToString(cell) : "";
	return label;
}

// Shortens the printed label by appending "..." if the name is to long
mxGraph.prototype.getLabel = function(cell) {
	let max;
	const label = (this.labelsVisible) ? this.convertValueToString(cell) : "";
	const geometry = this.model.getGeometry(cell);

	// Label as in the name of the node, the the actual label object
	const isLabel = typeof(cell.getValue()) === "string";
	if (isLabel) {
		max = 10;

		if (max < label.length) {
			return label.substring(0, max) + "...";
		}
	}
	
	if (!this.model.isCollapsed(cell) && geometry !== null && (geometry.offset === null ||
																																																								
		(geometry.offset.x === 0 && geometry.offset.y === 0)) && this.model.isVertex(cell) &&
		geometry.width >= 2) {
		const style = this.getCellStyle(cell);
		const fontSize = style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
		max = geometry.width / (fontSize * 0.625);
		if (max < label.length) {
			return label.substring(0, max) + "...";
		}
	}

	return label;
};

// Enables guidelines when dragging/inserting a cell
mxGraphHandler.prototype.guidesEnabled = true;

// ...alt disables guides
mxGuide.prototype.isEnabledForEvent = function(evt) {
	return !mxEvent.isAltDown(evt);
};

// Adds a connect image to each cell which is shown on hover
mxConnectionHandler.prototype.connectImage = new mxImage("./assets/images/connector.svg", 22, 22);

// Disable snap to grid
mxGraph.prototype.setGridEnabled(false);

mxGraph.prototype.selectAll = function(parent, descendants) {

	const newParent = parent || this.getDefaultParent();
	
	let sLayer = null; // graph layer containing microService nodes
	let fLayer = null; // graph layer containing flow nodes

	// Select all children to the default parent
	let cells = (descendants) ? this.model.filterDescendants(function(cell) {
		return cell !== newParent;
	}, newParent) : this.model.getChildren(newParent);
		
	// We don't want to select the microServiceLayer or flowLayer
	// Remove microServiceLayer and flowLayer from selection
	cells = this.model.filterCells(cells, function(cell) {
		
		if (!cell.isVisible()) {
			return false;
		}
		if (cell.id === "microServiceLayer") {
			sLayer = cell;
			return false;
		} else if ( cell.id === "flowLayer" ) {
			fLayer = cell;
			return false;
		}
		return true;
	});

	// Finally add mSL (microServiceLayer) and fL:s (flowLayer) children to the selection
	const sLayerChildren = this.model.getChildren(sLayer);
	const fLayerChildren = this.model.getChildren(fLayer);

	if (sLayerChildren) {
		cells = [...cells, ...sLayerChildren];
	}

	if (fLayerChildren) {
		cells = [...cells, ...fLayerChildren];
	}

	if (cells !== null) {
		this.setSelectionCells(cells);
	}
};

// Override panning to only pan in x-direction
mxPanningHandler.prototype.mouseMove = function(sender, me) {
	this.dx = me.getX() - this.startX;
	// this.dy = me.getY() - this.startY;
	this.dy = 0;
	
	if (this.active) {
		if (this.previewEnabled) {
			// Applies the grid to the panning steps
			if (this.useGrid) {
				this.dx = this.graph.snap(this.dx);
				this.dy = this.graph.snap(this.dy);
			}
			this.graph.panGraph(this.dx + this.dx0, this.dy + this.dy0);
		}

		this.fireEvent(new mxEventObject(mxEvent.PAN, "event", me));
	} else if (this.panningTrigger) {
		const tmp = this.active;

		// Panning is activated only if the mouse is moved
		// beyond the graph tolerance
		this.active = Math.abs(this.dx) > this.graph.tolerance || Math.abs(this.dy) > this.graph.tolerance;

		if (!tmp && this.active) {
			this.fireEvent(new mxEventObject(mxEvent.PAN_START, "event", me));
		}
	}
	
	if (this.active || this.panningTrigger) {
		me.consume();
	}
};


function cellMoved(node_type){
		
	if( node_type == "ExperienceMicroFlow" || node_type == "ProcessMicroFlow" || node_type == "InformationMicroFlow" ||  node_type == "InformationFlow"){
		
		var cells = graph.getModel().getCell("flowLayer").children;


		if(cells){
			for (var i=0; i<cells.length; i++){
				
				var largest;
				var countArray = [];
				var expCount = 0, proCount = 0, infoCount = 0;

				var cell_title = cells[i].getAttribute("title");
				let flows = JSON.parse(window.localStorage.flows);
				
				let thisFlow = flows[cell_title];

				if( cells[i].value ){

					for(var n=0; n<thisFlow.nodeIDs.length; n++){
						var node_id = thisFlow.nodeIDs[n];

						if( "ExperienceMicroFlow" == graph.getModel().getCell(node_id).value.nodeName+"MicroFlow" ){
							expCount++;
						}else if( "ProcessMicroFlow" == graph.getModel().getCell(node_id).value.nodeName+"MicroFlow" ){
							proCount++;
						}else if("InformationMicroFlow" == graph.getModel().getCell(node_id).value.nodeName+"MicroFlow"){
							infoCount++;
						}
						
						countArray.push(expCount, proCount, infoCount);
						
						largest = Math.max.apply(0, countArray);
					}
					var cell_width, cell_left,left_box_count=0,right_box_count=0;
					
					//var cell_width = (cells[i].geometry.width)*(largest+1)+(largest*100);

					if(largest == 0){

						cell_width = (cells[i].geometry.width);
						cell_left = (cells[i].geometry.x*0.86);

					}
					else if(largest == 1){

						cell_width = (cells[i].geometry.width)*(largest+2);
						cell_left = (cells[i].geometry.x*0.86)-(100);

					}
					else{

						cell_width = (cells[i].geometry.width)*(largest+2);

						var microflows = thisFlow.microflows;
						for( var m=0; m<microflows.length; m++){
							var microCell = window.graph.model.getCell(microflows[m]);
							if( (microCell.geometry.x+50) < cells[i].geometry.x ){
								left_box_count++;
							}else{
								right_box_count++
							}
						}

						if(left_box_count){
							cell_left = (cells[i].geometry.x*0.86)-((left_box_count+1)*100);
						}else if(right_box_count){
							cell_left = (cells[i].geometry.x*0.86)-(100);
						}
					}


					//var cell_width = cells[i].geometry.width*2;
					var div = document.createElement("div");
					var span = document.createElement("span");
					span.innerHTML = cells[i].getValue().getAttribute("title");
					div.setAttribute("class", "background_div");
					div.setAttribute("id", cells[i].getValue().getAttribute("title"));
					div.style.background = "rgba(158, 158, 158, 0.16)";
					div.style.width = cell_width+"px";
					div.style.height = "386px";
					div.style.position = "absolute";
					//div.style.left = (cells[i].geometry.x*0.86+10)-(cells[i].geometry.width);
					//div.style.left = (cells[i].geometry.x*0.86-5)-(largest*100);
					div.appendChild(span);
					div.style.top = "150px";

					if( node_type == "InformationFlow"){
						//div.style.top = "0px";
						div.style.left = cell_left-5;
						//document.getElementById("swimlane-5").appendChild(div);
					}else{
						//div.style.top = "152px";
						div.style.left = cell_left-5;
						//document.getElementById("graph_Container").appendChild(div);
					}

					document.getElementById("graph_Container").appendChild(div);

					if( $("#graph_Container")[0].offsetWidth < $("#graph_Container")[0].scrollWidth ){
						$("#graph_Container").animate({scrollLeft: 200}, 800);
					}
				}

			}
		}
	}
}

// Highlight drop targets when dragging a new node into view
mxDragSource.prototype.startDrag = function(evt) {

	var node_type = this.element.getAttribute("nodeType");

	cellMoved(node_type)

	evt.preventDefault();

	let divTarget;

	switch(this.element.getAttribute("nodeType")) {
	case "AppTarget":
		divTarget = document.getElementById("swimlane-1");
		break;
	case "InformationFlow":
		divTarget = document.getElementById("swimlane-5");
		break;
	case "AppSource":
		divTarget = document.getElementById("swimlane-6");
		break;
	case "ExperienceMicroFlow":
		divTarget = document.getElementById("swimlane-2").getElementsByTagName("div")[0];
		break;	
	case "ProcessMicroFlow":
		divTarget = document.getElementById("swimlane-3").getElementsByTagName("div")[0];
		break;	
	case "InformationMicroFlow":
		divTarget = document.getElementById("swimlane-4").getElementsByTagName("div")[0];
		break;
	default:
		divTarget = container;
	}

	divTarget.classList.add("highlighted");
	this.dragElement = this.createDragElement(evt);
	this.dragElement.style.position = "absolute";
	this.dragElement.style.zIndex = this.dragElementZIndex;
	mxUtils.setOpacity(this.dragElement, this.dragElementOpacity);
};

/**
 * Function: stopDrag
 * 
 * Invokes <removeDragElement>.
 */
mxDragSource.prototype.stopDrag = function() {

	/** Removed Flow Background */
	const flow_background = document.getElementsByClassName("background_div");

	for(let j = flow_background.length; j >= 0; j--) {
		if(flow_background[j]){
			flow_background[j].remove();
		}
	}


	const highlighted = document.getElementsByClassName("highlighted");

	for(let i = 0; i < highlighted.length; i++) {
		highlighted[i].classList.remove("highlighted");
	}

	// LATER: This used to have a mouse event. If that is still needed we need to add another
	// final call to the DnD protocol to add a cleanup step in the case of escape press, which
	// is not associated with a mouse event and which currently calles this method.
	this.removeDragElement();
};
