const _ = require("lodash");

import { uniq, forEach, remove, isEmpty } from "lodash";
import { initMxIconSet } from "./mxIconSet.js";
import { styleConstants } from "./constants.js";
import graphUtils from "./utilities.js";
import axios from "axios";

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

		// DEBUG: console.log cell on click
		this.graph.addListener(mxEvent.CLICK, function(sender, evt) {
			const cell = evt.getProperty("cell");
			
			if (cell) {
				//console.log(cell);
			}
		});

		this.setupRightClickMenu();
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
			//console.log(mxUtils.getPrettyXml(node));

		});

		/**
		 * Creates a flow from selected cells
		 */
		this.editor.addAction("groupFlow", () => {

			let flows = {};

			if(window.localStorage.flows) {
				flows = JSON.parse(window.localStorage.flows);	
			}

			const newFlow = {};


			const title = prompt("Enter flow name:");
			if(!title) {
				alert("Please provide a flowname!");
				return;
			}

			if(flows[title]) {
				alert("Title already in use");
				return;
			}

			newFlow.title = title;
			newFlow.description = "Default description";
			newFlow.nodeIDs = [];

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
			const margin = 20;
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


		/*** Create Flow Graph, Collect Data from the Databse */
	//	graphUtils.CreateFlowGraph1(this.graph, sidebarContainer, this.targetNode);


		// Setup toolbar
		const spacer = document.createElement("div");
		spacer.style.display = "inline";
		spacer.style.padding = "8px";

		graphUtils.addToolbarButton(this.editor, toolbarContainer, "toggleMicroFlow", "", "./assets/images/eye.svg", true);
		graphUtils.addToolbarButton(this.editor, toolbarContainer, "toggleFullScreen", "", "./assets/images/zoom-to-fit.svg", true );
		
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
		this.targetNode.setAttribute("title", "Target2");

		this.flowNode.setAttribute("nodeType", "Information");
		this.flowNode.setAttribute("title", "Flow2");

		this.sourceNode.setAttribute("nodeType", "App");
		this.sourceNode.setAttribute("title", "Source2");

		// MicroFlows
		this.expMicroNode.setAttribute("nodeType", "MicroFlow");
		this.expMicroNode.setAttribute("title", "MicroFlow");

		this.procMicroNode.setAttribute("nodeType", "MicroFlow");
		this.procMicroNode.setAttribute("title", "MicroFlow");

		this.infoMicroNode.setAttribute("nodeType", "MicroFlow");
		this.infoMicroNode.setAttribute("title", "MicroFlow");



		/*********Extra styles for graph creation Begin********* */

		/*this.targetNode.setAttribute("x", 218);
		this.targetNode.setAttribute("y", 6);
		this.targetNode.setAttribute("style", "target");
		this.targetNode.setAttribute("id", "1");
		this.targetNode.setAttribute("endPoints", [2,4]);

		this.flowNode.setAttribute("x", 218);
		this.flowNode.setAttribute("y", 306);
		this.flowNode.setAttribute("style", "flow");
		this.flowNode.setAttribute("id", "2");
		this.flowNode.setAttribute("endPoints", [3]);
		
		this.sourceNode.setAttribute("x", 100);
		this.sourceNode.setAttribute("y", 573);
		this.sourceNode.setAttribute("style", "source");
		this.sourceNode.setAttribute("id", "3");
		this.sourceNode.setAttribute("endPoints", []);

		// MicroFlows
		this.expMicroNode.setAttribute("x", 218);
		this.expMicroNode.setAttribute("y", 164);
		this.expMicroNode.setAttribute("style", "microflow");
		this.expMicroNode.setAttribute("id", "4");
		this.expMicroNode.setAttribute("endPoints", [5]);
		
		this.procMicroNode.setAttribute("x", 218);
		this.procMicroNode.setAttribute("y", 295);
		this.procMicroNode.setAttribute("style", "microflow");
		this.procMicroNode.setAttribute("id", "5");
		this.procMicroNode.setAttribute("endPoints", [6]);
		
		this.infoMicroNode.setAttribute("x", 218);
		this.infoMicroNode.setAttribute("y", 428);
		this.infoMicroNode.setAttribute("style", "microflow");
		this.infoMicroNode.setAttribute("id", "6");
		this.infoMicroNode.setAttribute("endPoints", [3]);

		this.edge1.start = 1;
		this.edge1.end = 1;
		this.edge2 = [2, 3];
		this.edge3 = [1, 4];
		this.edge4 = [4, 5];
		this.edge5 = [5, 6];
		this.edge6 = [6, 3];*/

	
		/*********Extra styles for graph creation End********* 

		this.graphNodes.push(this.targetNode);
		this.graphNodes.push(this.flowNode);
		this.graphNodes.push(this.sourceNode);
		this.graphNodes.push(this.expMicroNode);
		this.graphNodes.push(this.procMicroNode);
		this.graphNodes.push(this.infoMicroNode);*/

		/*this.graphEdges.push(this.edge1);
		this.graphEdges.push(this.edge2);
		this.graphEdges.push(this.edge3);
		this.graphEdges.push(this.edge4);
		this.graphEdges.push(this.edge5);
		this.graphEdges.push(this.edge6);*/

	}
	
	/**
	 * Sets up the menu which displays on right click of a cell
	 */
	setupRightClickMenu() {
		// setup right click menu
		mxPopupMenu.prototype.autoExpand = true;
		let that = this;
		this.graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
			
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
		};
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
	start() {
		this.graph.getModel().beginUpdate();
		try {
			this.graphData = {};
			let that = this;
			
			//graphUtils.buildFlowGraph(that.graph,that.graphNodes);

			if (localStorage.graphData) {
				graphUtils.readFromLocalstorage(this.graph);
			} else {
				// If no saved graph in localStorage, initialize the default graph
				graphUtils.read(this.graph, "./assets/xml/defaultGraph.xml");
			}


			/*
			*	API Call for getting Integration Flow in the selected Project
			
			axios.get('/api/get/project/1').then(function(response){
				
				var child = response.data.childCells;

				const xmlDocument = mxUtils.createXmlDocument();
				that.targetNode = xmlDocument.createElement("Target");
				that.flowNode = xmlDocument.createElement("Flow");
				that.sourceNode = xmlDocument.createElement("Source");
				that.expMicroNode = xmlDocument.createElement("Experience");
				that.procMicroNode = xmlDocument.createElement("Process");
				that.infoMicroNode = xmlDocument.createElement("Information");

				for( var f=0; f<child.length; f++ ){
					var cell_type = child[f].type;
					if(cell_type == "system"){
						
						if(child[f].mf_style == "target"){

							that.targetNode.setAttribute("nodeType", "App");
							that.targetNode.setAttribute("title", child[f].mf_name);
							that.targetNode.setAttribute("x", child[f].mf_posX);
							that.targetNode.setAttribute("y", child[f].mf_posY);
							that.targetNode.setAttribute("style", child[f].mf_style);
							that.targetNode.setAttribute("id", child[f].mf_cell_id);
							that.targetNode.setAttribute("endPoints", [2,4]);
												
						}else{

							that.sourceNode.setAttribute("nodeType", "App");
							that.sourceNode.setAttribute("title", child[f].mf_name);
							that.sourceNode.setAttribute("x", child[f].mf_posX);
							that.sourceNode.setAttribute("y", child[f].mf_posY);
							that.sourceNode.setAttribute("style", child[f].mf_style);
							that.sourceNode.setAttribute("id", child[f].mf_cell_id);
							that.sourceNode.setAttribute("endPoints", []);
						}
					}
					
					else if(cell_type == "microFlow"){

						//that.expMicroNode.setAttribute("nodeType", "MicroFlow");
						that.expMicroNode.setAttribute("title", "MicroFlow");

						that.procMicroNode.setAttribute("nodeType", "MicroFlow");
						that.procMicroNode.setAttribute("title", "MicroFlow");
				
						that.infoMicroNode.setAttribute("nodeType", "MicroFlow");
						//that.infoMicroNode.setAttribute("title", "MicroFlow");
					}
				}

				var parent = response.data.flow;
				for( var f=0; f<parent.length; f++ ){
					var cell_type = parent[f].type;
					if(cell_type == "flow"){
						
						that.flowNode.setAttribute("nodeType", "Information");
						that.flowNode.setAttribute("title", parent[f].int_name);
						that.flowNode.setAttribute("x", parent[f].int_posX);
						that.flowNode.setAttribute("y", parent[f].int_posY);
						that.flowNode.setAttribute("style", parent[f].int_style);
						that.flowNode.setAttribute("id", parent[f].int_cell_id);
						that.flowNode.setAttribute("endPoints", [3]);
					}
				} 



				that.graphNodes.push(that.targetNode);
				that.graphNodes.push(that.flowNode);
				that.graphNodes.push(that.sourceNode);
				//that.graphNodes.push(that.expMicroNode);
				that.graphNodes.push(that.procMicroNode);
				//that.graphNodes.push(that.infoMicroNode);


				graphUtils.buildFlowGraph(that.graph,that.graphNodes);

			}).catch(function(error){
				//Some error occurred
			});
			*/
		} 
		finally {

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

		this.toggleFullScreen(false);
		
	}
}

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

// Shortens the printed label by appending "..." if the name is to long
mxGraph.prototype.getLabel = function(cell) {
	let max;
	const label = (this.labelsVisible) ? this.convertValueToString(cell) : "";
	const geometry = this.model.getGeometry(cell);


	// Label as in the name of the node, the the actual label object
	const isLabel = typeof(cell.getValue()) === "string";

	if (isLabel) {
		max = 8;

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

// Highlight drop targets when dragging a new node into view
mxDragSource.prototype.startDrag = function(evt) {
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
	
	const highlighted = document.getElementsByClassName("highlighted");

	for(let i = 0; i < highlighted.length; i++) {
		highlighted[i].classList.remove("highlighted");
	}

	// LATER: This used to have a mouse event. If that is still needed we need to add another
	// final call to the DnD protocol to add a cleanup step in the case of escape press, which
	// is not associated with a mouse event and which currently calles this method.
	this.removeDragElement();
};

