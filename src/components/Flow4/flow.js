

import { uniq, forEach, remove, isEmpty } from "lodash";
import { initMxIconSet } from "./mxIconSet.js";
import { read, addSidebarIcon, configureStylesheet, addToolbarButton, readFromLocalstorage, toggleFlowMicroLayers } from "./utilities.js";
import { styleConstants } from "./constants.js";

console.warn("[Deprecation] flow.js has a terrible complexibility and is deprecated. Use the FlowClass.js instead");

/**
 * Inits the mxGraph
 * @param  {DOM Element} container        [Main graph container]
 * @param  {DOM Element} sidebarContainer [Drag icons container]
 * @param  {DOM Element} toolbarContainer [Functionality icons container]
 * @param  {DOM Element} sidebarLeft      [Sidebar to the left]
 * @param  {Function} 	 onUpdate         [Function that is called on update]
 */
export function initGraph(container, sidebarContainer, toolbarContainer, sidebarLeft, onUpdate, onCreateFlow, refreshFlows) {
	// Checks if the browser is supported
	if (!mxClient.isBrowserSupported()) {
		mxUtils.error("Browser is not supported!", 200, false);
	} else {
		// Assigns some global constants for general behaviour, eg. minimum
		// size (in pixels) of the active region for triggering creation of
		// new connections, the portion (100%) of the cell area to be used
		// for triggering new connections, as well as some fading options for
		// windows and the rubberband selection.

		mxConstants.MIN_HOTSPOT_SIZE = 1;
		mxConstants.DEFAULT_HOTSPOT = 16;


		// Setup node types
		const xmlDocument = mxUtils.createXmlDocument();
		const targetNode = xmlDocument.createElement("Target");
		targetNode.setAttribute("nodeType", "App");
		targetNode.setAttribute("title", "Target");

		const flowNode = xmlDocument.createElement("Flow");
		flowNode.setAttribute("nodeType", "Information");
		flowNode.setAttribute("title", "Flow");

		const sourceNode = xmlDocument.createElement("Source");
		sourceNode.setAttribute("nodeType", "App");
		sourceNode.setAttribute("title", "Source");

		// MicroFlows
		const expMicroNode = xmlDocument.createElement("Experience");
		expMicroNode.setAttribute("nodeType", "MicroFlow");
		expMicroNode.setAttribute("title", "MicroFlow");

		const procMicroNode = xmlDocument.createElement("Process");
		procMicroNode.setAttribute("nodeType", "MicroFlow");
		procMicroNode.setAttribute("title", "MicroFlow");

		const infoMicroNode = xmlDocument.createElement("Information");
		infoMicroNode.setAttribute("nodeType", "MicroFlow");
		infoMicroNode.setAttribute("title", "MicroFlow");


		// Initialize the editor
		const editor = new mxEditor();
		const graph = editor.graph;

		graph.view.fullscreen = false;

		window.graph = graph;

		graph.setConnectable(true);
		graph.setTooltips(false);
		graph.setAllowDanglingEdges(false);

		// Gets the default parent for inserting new cells. This
		// is normally the first child of the root (ie. layer 0).
		const parent = graph.getDefaultParent();


		// Setup layers
		const microServiceLayer = new mxCell();
		const flowLayer = new mxCell();

		microServiceLayer.setId("microServiceLayer");
		flowLayer.setId("flowLayer");

		graph.addCell(microServiceLayer);
		graph.addCell(flowLayer);


		editor.setGraphContainer(container);
		const config = mxUtils.load(
			"./assets/xml/keyhandler-commons.xml"). // Stored in 'public' folder 
			getDocumentElement();
		editor.configure(config);

		// Setup connection restrictions
		graph.multiplicities.push(new mxMultiplicity(true, "Target", "nodeName", null, null, null, ["Flow", "Experience"], "", "Target Must Connect to Flow"));
		graph.multiplicities.push(new mxMultiplicity(true, "Experience", "nodeName", null, null, null, ["Target", "Process"], "", "Experience Must Connect to Target"));
		graph.multiplicities.push(new mxMultiplicity(true, "Process", "nodeName", null, null, null, ["Experience", "Information"], "", "Experience Must Connect to Target"));
		graph.multiplicities.push(new mxMultiplicity(true, "Source", "nodeName", null, null, null, ["Flow", "Information"], "", "Source Must Connect to Flow"));


		// DEBUG: logs the graph model to the console
		editor.addAction("export", function() {
			/*
            var textarea = document.createElement('textarea');
            textarea.style.width = '400px';
            textarea.style.height = '400px';
            var enc = new mxCodec(mxUtils.createXmlDocument());
            var node = enc.encode(editor.graph.getModel());
            textarea.value = mxUtils.getPrettyXml(node);
            showModalWindow(graph, 'DEBUG', textarea, 700, 700);
            */
			
			const enc = new mxCodec(mxUtils.createXmlDocument());
			const node = enc.encode(graph.getModel());
			console.log(mxUtils.getPrettyXml(node));
			
		
			// toggleFullScreen(graph);
		});

		editor.addAction("groupFlow", function() {

			let flows = {};

			if(window.localStorage.flows) {
				flows = JSON.parse(window.localStorage.flows);	
			}

			const newFlow = {};

			
			const title = prompt("Enter flow name:");
			console.log(title);
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

			if(!graph.flows) {
				graph.flows = [];
			}

			const selCells = graph.getSelectionCells();

			for(let i = 0; i < selCells.length; i++) {
				const cell = selCells[i];
				if(!cell.edge) {
					newFlow.nodeIDs.push(cell.getId());
				}
			}

			flows[title] = newFlow;
			

			localStorage.setItem("flows", JSON.stringify(flows) );

			refreshFlows();

		});

		editor.addAction("toggleFullScreen", function() {
			toggleFullScreen(graph);
		});

		editor.addAction("toggleMicroFlow", function() {
			toggleFlowMicroLayers(graph);
		});
		

		editor.addAction("fit", function() {
			const margin = 20;
			const max = 3;

			const bounds = graph.getGraphBounds();
			const cw = graph.container.clientWidth - margin;
			const ch = graph.container.clientHeight - margin;
			const w = bounds.width / graph.view.scale;
			const h = bounds.height / graph.view.scale;
			const s = Math.min(max, Math.min(cw / w, ch / h));

			graph.view.scaleAndTranslate(s,
			  (margin + cw - w * s) / (2 * s) - bounds.x / graph.view.scale,
			  (margin + ch - h * s) / (2 * s) - bounds.y / graph.view.scale);
		});


		const toggleFullScreen = function(graph, isFullScreen) {

			if(isFullScreen !== undefined) {
				graph.view.fullscreen = isFullScreen;				
			} else {
				graph.view.fullscreen = !graph.view.fullscreen || false;
			}

			// Zoomed in mode
			if(!graph.view.fullscreen) {
				let cssBorder = graph.getBorderSizes();
				let s = graph.view.scale;

				let h1 = graph.container.offsetHeight - cssBorder.y - cssBorder.height - 1;
				const h2 = 8 * styleConstants.cell.height;

				const s2 = h1 / h2;

				graph.view.scaleAndTranslate(s2, 0, 0);

				document.getElementById("swimlanes").style.display = null;

			// Full screen mode
			} else {
				document.getElementById("swimlanes").style.display = "none";
				editor.execute("fit");
			}
		};		


		// Shows icons if the mouse is over a cell
		initMxIconSet(graph);

		// DEBUG: Show xml document on 'F19' click
		const keyHandler = new mxKeyHandler(graph);

		keyHandler.bindKey(129, function() {
			if (graph.isEnabled()) {
				editor.execute("groupFlow");
			}
		});
		keyHandler.bindKey(130, function() {
			if (graph.isEnabled()) {
				editor.execute("export");
			}
		});

		// Disable folding of cells
		graph.isCellFoldable = function() {
			return false;
		};

		// Disable resizing of cells
		graph.isCellResizable = function() {
			return false;
		};

		// DEBUG: console.log cell on click
		graph.addListener(mxEvent.CLICK, function(sender, evt) {
			const cell = evt.getProperty("cell");

			if (cell) {
				//console.log(cell);
			}
		});

		// Change name on dblclick
		graph.dblClick = function(evt, cell) {
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

		/* 
        * Sets the label to the attribute provided by the node
        */
		graph.convertValueToString = function(cell) {
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

		// Shortens the printed label
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


		// setup right click menu
		mxPopupMenu.prototype.autoExpand = true;
		
		graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
			if (cell !== null && localStorage.flows) {

				let flows = JSON.parse(localStorage.flows);
				
				menu.addItem("Create flow", null, ()=>{
					editor.execute("groupFlow");
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
							
							refreshFlows();

						}, submenu1);
					});
				}

				// let flowButton = submenu.addItem("asdf", null, function(){
				// 	mxUtils.alert(graph.getSelectionCount()+' selected cells');
				// });
			}
		};

		/* 
        * Setup User Interface
        */

		configureStylesheet(graph);

		// Add drag buttons to the sidebar
		addSidebarIcon(graph, sidebarContainer, targetNode, "target", parent);
		addSidebarIcon(graph, sidebarContainer, flowNode, "flow", flowLayer);

		// MicroFlows
		addSidebarIcon(graph, sidebarContainer, expMicroNode, "microflow", microServiceLayer);
		addSidebarIcon(graph, sidebarContainer, procMicroNode, "microflow", microServiceLayer);
		addSidebarIcon(graph, sidebarContainer, infoMicroNode, "microflow", microServiceLayer);

		addSidebarIcon(graph, sidebarContainer, sourceNode, "source", parent);


		// Setup toolbar
		const spacer = document.createElement("div");
		spacer.style.display = "inline";
		spacer.style.padding = "8px";

		// addToolbarButton(editor, toolbarContainer, null, '', './eye.svg', true, toggleFlowMicroLayers, [graph] );
		addToolbarButton(editor, toolbarContainer, "toggleMicroFlow", "", "./assets/images/eye.svg", true);
		addToolbarButton(editor, toolbarContainer, "toggleFullScreen", "", "./assets/images/zoom-to-fit.svg", true );
		// toolbarContainer.appendChild(spacer.cloneNode(true));
		// addToolbarButton(editor, toolbarContainer, 'fit', '', './zoom-to-fit.svg', true );
		// addToolbarButton(editor, toolbarContainer, 'zoomOut', '', './zoom-out.svg', true );
		// addToolbarButton(editor, toolbarContainer, 'zoomIn', '', './zoom-in.svg', true );


		// Setup swimlanes
		// renderSwimlanes(graph, container);


		// Installs automatic validation 
		const listener = function() {

			const enc = new mxCodec(mxUtils.createXmlDocument());
			const node = enc.encode(editor.graph.getModel());
			const data = mxUtils.getPrettyXml(node);

			// Update local storage
			localStorage.setItem("graphData", data);


			if (localStorage.flows) {
				const flows = JSON.parse(localStorage.flows);

				forEach(flows, function(value, key) {	
					
					// Are there any nodes in the flow?
					if (!value.nodeIDs.length) {
						delete flows[key];
					} else {
						value.nodeIDs = remove(value.nodeIDs, function(id) {
							return graph.model.getCell(id);
						});
					}
				});

				localStorage.setItem("flows", JSON.stringify(flows) );
			}


			// Calls the onUpdate function supplied as argument.
			onUpdate(node);

			graph.validateGraph();
		};

		graph.getModel().addListener(mxEvent.CHANGE, listener);


		graph.getModel().beginUpdate();
		try {
			if (localStorage.graphData) {
				readFromLocalstorage(graph);
			} else {
				// If no saved graph in localStorage, initialize the default graph
				read(graph, "./assets/xml/defaultGraph.xml");
			}
		} finally {


			// Updates the display
			graph.getModel().endUpdate();

			const showFlowLayer = window.localStorage.showFlowLayer || "true";
			localStorage.setItem("showFlowLayer", showFlowLayer);

			if(!localStorage.flows) {
				localStorage.setItem( "flows", JSON.stringify({}) );
			}

			if(showFlowLayer === "true") {
				toggleFlowMicroLayers(graph, true);	
			} else {
				toggleFlowMicroLayers(graph, false);	
			}

			
		}

		toggleFullScreen(graph, false);

		// Execute 'fit' to make the whole graph fit inside the container
		// editor.execute("fit");
	}
}


/**
 * @OVERRIDES
 */
// Enables guides
mxGraphHandler.prototype.guidesEnabled = true;

mxConnectionHandler.prototype.connectImage = new mxImage("./assets/images/connector.svg", 22, 22);

// Alt disables guides
mxGuide.prototype.isEnabledForEvent = function(evt) {
	return !mxEvent.isAltDown(evt);
};

// Disable snap to grid
mxGraph.prototype.setGridEnabled(false);

// Select all 
mxGraph.prototype.selectAll = function(parent, descendants) {
	const newParent = parent || this.getDefaultParent();
	
	let sLayer = null; // graph layer containing microService nodes
	let fLayer = null; // graph layer containing flow nodes

	// Select all children to the default parent
	let cells = (descendants) ? this.model.filterDescendants(function(cell) {
		return cell !== newParent;
	}, newParent) : this.model.getChildren(newParent);
		
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

	// Finally add mSL and fL:s children to the selection
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

// Override panning to only pan in x direction
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

mxDragSource.prototype.startDrag = function(evt) {
	evt.preventDefault();
	console.log(document.getElementById("swimlane-4"));

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

	console.log(divTarget);
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

/*
	* Override alert behavior
	*/
// mxGraph.prototype.validationAlert = function(message)
// {
//     mxUtils.alert(message);
// };
