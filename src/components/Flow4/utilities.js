/**
 * Utility functions used by the graph
 */

import { styleConstants } from "./constants.js";

const graphUtils = {
	read: read,
	readFromLocalstorage: readFromLocalstorage,
	addToolbarButton: addToolbarButton,
	addSidebarIcon: addSidebarIcon,
	showModalWindow: showModalWindow,
	showFlowDragButton: showFlowDragButton,
	toggleFlowMicroLayers: toggleFlowMicroLayers,
	renderSwimlanes: renderSwimlanes,
	configureStylesheet: configureStylesheet,
};

export default graphUtils;

/**
 * Reads a graph from disc
 * @param  {mxGraph} graph    The graph object
 * @param  {file.xml} filename path to the *.xml
 */
function read(graph, filename) {
	const req = mxUtils.load(filename);
	const root = req.getDocumentElement();
	const dec = new mxCodec(root.ownerDocument);
	console.log(root);

	dec.decode(root, graph.getModel());
}

/**
 * Reads from localStorage
 * @param  {mxGraph} graph The graph object
 */
function readFromLocalstorage(graph) {
	if (!localStorage.graphData) {
		console.error("Tried to read graph data from local storage, but there is no graph data stored");
		return;
	}

	const parser = new DOMParser();
	const req = parser.parseFromString(localStorage.graphData, "text/xml");
	const root = req.childNodes[0];
 	const dec = new mxCodec(root.ownerDocument);

	dec.decode(root, graph.getModel());
}


/**
 * Adds a button to the toolbar
 * @param {mxEditor}  editor      The default editor
 * @param {DOM Element}  toolbar  The DOM element to append the button to
 * @param {String}  action        The action that should be executed when button is clicked
 * @param {String}  label         The icon label
 * @param {String}  image         Path to the image
 * @param {Boolean} isTransparent Should background be transparent
 * @param {Function}  call        Optional function that should be called onClick
 * @param {Array}  callArguments Array of arguments supplied to the call function
 */
function addToolbarButton(editor, toolbar, action, label, image, isTransparent, call, callArguments) {
	const button = document.createElement("button");
	button.style.fontSize = "10";

	if (image !== null) {
		const img = document.createElement("img");
		img.setAttribute("src", image);
		img.style.width = "32px";
		img.style.height = "32px";
		img.style.verticalAlign = "middle";
		img.style.marginRight = "2px";
		button.appendChild(img);
	}
	if (isTransparent) {
		button.style.background = "transparent";
		button.style.color = "#FFFFFF";
		button.style.border = "none";
	}
	mxEvent.addListener(button, "click", function() {
		// If 'call' argument is passed, execute call
		if (call) {
        	call.apply(this, callArguments);
		} else {
        	editor.execute(action);
		}
	});
	mxUtils.write(button, label);
	toolbar.appendChild(button);
}

/**
 * Adds a sidebar icon
 * @param {mxGraph} graph   The mxGraph object
 * @param {DOM Element} sidebar The DOM container
 * @param {xml-node} node    XML-node layout
 */
function addSidebarIcon(graph, sidebar, node) {
	let image = null;
	let style = null;
	let title1 = null;
	let title2 = null;


	if (node.nodeName === "Target") {
		image = "./assets/images/target-white.svg";
		style = "target";
		title1 = "App";
		title2 = "Target";
	} else if (node.nodeName === "Flow") {
		image = "./assets/images/Integration-white.svg";
		style = "flow";
		title1 = "Information";
		title2 = "Flow";
	} else if (node.nodeName === "Source") {
		image = "./assets/images/database-white.svg";
		style = "source";
		title1 = "App";
		title2 = "Source";
	} else if (node.nodeName === "Experience") {
		image = "./assets/images/MicroFlow.svg";
		style = "microflow";
		title1 = "Experience";
		title2 = "MicroFlow";
	} else if (node.nodeName === "Process") {
		image = "./assets/images/MicroFlow.svg";
		style = "microflow";
		title1 = "Process";
		title2 = "MicroFlow";
	} else if (node.nodeName === "Information") {
		image = "./assets/images/MicroFlow.svg";
		style = "microflow";
		title1 = "Information";
		title2 = "MicroFlow";
	} else {
		console.log(node.nodeName);
	}

	// Function that is executed when the image is dropped on
	// the graph. The cell argument points to the cell under
	// the mousepointer if there is one.
	const funct = function(graph, evt, cell, x, y) {
		const model = graph.getModel();

		let parent = graph.getDefaultParent();

		const microLayer = graph.getModel().getCell("microServiceLayer");
		const flowLayer = graph.getModel().getCell("flowLayer");

		if (node.nodeName === "Flow") {
			parent = flowLayer;
		}

		if ( node.nodeName === "Experience" ||
        	node.nodeName === "Process" ||
        	node.nodeName === "Information") {
        		parent = microLayer;
		}

		let v1 = null;

		model.beginUpdate();
		try {
			const newNode  = node.cloneNode(true); // Clone node to avoid direct references

			// Insert a vertex at the dropped position
			v1 = graph.insertVertex(parent, null, newNode, x, y, styleConstants.cell.width, styleConstants.cell.height, style);

			// Adds a child vertex to v1 which is the name of the node
			const label = graph.insertVertex(v1, null, title2, 0.5, 0.85, 0, 0, "title2", true );
			label.setConnectable(false);
			v1.setConnectable(true);

			// Presets the collapsed size
			v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
		} finally {
			model.endUpdate();
		}

		graph.setSelectionCell(v1);
	};

	// Creates the image which is used as the sidebar icon (drag source)
	const div = document.createElement("div");
	const img = document.createElement("img");
	const t1  = document.createElement("span");
	const t2  = document.createElement("span");
	const plus = document.createElement("span");

	div.style.width = styleConstants.cell.width;
	div.style.height = styleConstants.cell.height;
	div.style.margin = "auto";
	div.style.marginBottom = "20px";
	div.style.padding = "15px";
	div.style.backgroundColor = "rgba(255,255,255,0.1)";
	div.style.cursor = "pointer";
	div.style.position = "relative";
	div.setAttribute("nodeType", title1 + title2);


	if (title2 === "MicroFlow") {
    	div.className = "microflow-drag-element";
	} else if (title2 === "Flow") {
    	div.className = "flow-drag-element";
	}

	img.setAttribute("src", image);
	img.style.width = styleConstants.cell.width / 3;
	img.style.height = styleConstants.cell.width / 3;
	img.style.opacity = "0.3";
	img.title = "Drag this to the diagram to create a new vertex";

	t1.innerHTML = title1;
	t1.style.fontSize = styleConstants.cell.t1.fontSize;
	t1.style.color = "rgba(255,255,255,0.3)";

	t2.innerHTML = title2;
	t2.style.fontSize = styleConstants.cell.t2.fontSize;
	t2.style.color = "rgba(255,255,255,0.2)";


	plus.innerHTML = "+";
	plus.style.position = "absolute";
	plus.style.fontSize = "72px";
	plus.style.left = "35";
	plus.style.top = "-15";


	div.appendChild(img);
	div.appendChild(document.createElement("br"));
	div.appendChild(t1);
	div.appendChild(document.createElement("br"));
	div.appendChild(t2);
	div.appendChild(plus);
	sidebar.appendChild(div);

	const dragElt = document.createElement("div");
	dragElt.style.border = "dashed black 1px";
	dragElt.style.width = styleConstants.cell.width;
	dragElt.style.height = styleConstants.cell.height;

	// Creates the image which is used as the drag icon (preview)
	const ds = mxUtils.makeDraggable(div, graph, funct, dragElt, 0, 0, true, true);
	ds.setGuidesEnabled(true);
}
/**
 * Shows a mxGraph modal window
 * @param  {mxGraph} graph   The mxGraph object
 * @param  {String} title   Title of the modal window
 * @param  {String} content Content of the modal window
 * @param  {Int} width   Width of modal window
 * @param  {Int} height  Height of modal window
 */
function showModalWindow(graph, title, content, width, height) {
	const background = document.createElement("div");
	background.style.position = "absolute";
	background.style.left = "0px";
	background.style.top = "0px";
	background.style.right = "0px";
	background.style.bottom = "0px";
	background.style.background = "black";
	mxUtils.setOpacity(background, 50);
	document.body.appendChild(background);

	if (mxClient.IS_IE) {
		mxDivResizer(background);
	}

	const x = Math.max(0, document.body.scrollWidth / 2 - width / 2);
	const y = Math.max(10, (document.body.scrollHeight ||
																document.documentElement.scrollHeight) / 2 - height * 2 / 3);
	const wnd = new mxWindow(title, content, x, y, "100%", "100%", false, true);
	wnd.setClosable(true);

	// Fades the background out after after the window has been closed
	wnd.addListener(mxEvent.DESTROY, function() {
		graph.setEnabled(true);
		mxEffects.fadeOut(background, 50, true,
			10, 30, true);
	});

	graph.setEnabled(false);
	graph.tooltipHandler.hide();
	wnd.setVisible(true);
}

/**
 * Shows the Flow drag button 
 * @param  {Boolean} shouldShow Boolean deciding if the Flow drag button should show
 */
function showFlowDragButton(shouldShow) {
	let showElements = null;
	let hideElements = null;
	
	if (shouldShow) {
		showElements = document.getElementsByClassName("flow-drag-element");
		hideElements = document.getElementsByClassName("microflow-drag-element");
	} else {
		showElements = document.getElementsByClassName("microflow-drag-element");
		hideElements = document.getElementsByClassName("flow-drag-element");
	}

	const showLength = showElements.length;
	const hideLength = hideElements.length;

	// Save lengths outside and use a for(let i...) loop for efficiency
	for (let i = 0; i < hideLength; i++) {
		hideElements[i].style.display = "none";
	}
	for (let i = 0; i < showLength; i++) {
		showElements[i].style.display = "inherit";
	}
}

/**
 * Toggles view between Flows and microFlows
 * @param  {mxGraph} graph The mxGraph object
 */
function toggleFlowMicroLayers(graph, isShown) {


	let showFlowLayer = window.localStorage.showFlowLayer;

	if(isShown !== undefined) {
		showFlowLayer = isShown;
	}

	// Some browser can't store booleans in localStorage
	// thus we have to store it as an ugly string
	if (showFlowLayer === "true") {
		showFlowLayer = false;
		graph.view.showFlowLayer = false;
	} else if (showFlowLayer === "false") {
		showFlowLayer = true;
		graph.view.showFlowLayer = true;
	}

	if(showFlowLayer) {
		document.getElementById("microflows-row").style.display = "none";
		document.getElementById("flow-row").style.display = null;
	} else {
		document.getElementById("microflows-row").style.display = null;
		document.getElementById("flow-row").style.display = "none";
	}

	// Update local storage
	localStorage.setItem("showFlowLayer", showFlowLayer);

	// ...and hide/show the relevant layers
	const ml = graph.getModel().getCell("microServiceLayer");
	const fl = graph.getModel().getCell("flowLayer");

	graph.getModel().setVisible(fl, showFlowLayer);
	graph.getModel().setVisible(ml, !showFlowLayer);

	// Finally toggle visibility on sidebar icons
	showFlowDragButton(showFlowLayer);
}


function renderSwimlanes(graph, container) {

	
	const swimlaneContainer = document.createElement("div");

	swimlaneContainer.style.position = "absolute";
	swimlaneContainer.style.top = "0";
	swimlaneContainer.style.bottom = "0";
	swimlaneContainer.style.left = "0";
	swimlaneContainer.style.right = "0";
	swimlaneContainer.style.zIndex = "-9999";


	let swimlanes = [];
	for(let i = 0; i < 6; i++) {
		const row = document.createElement("div");
		const span = document.createElement("span");
		row.className = "swimlane";
		span.style.position = "absolute";
		span.style.color = "rgba(255,255,255,0.6)";
		span.style.left = "10px";

		if(i === 0) {
			span.innerHTML = "Target Apps";
			span.style.bottom = "0px";
			row.style.borderBottom = "4px solid rgba(255,255,255,0.3)";
		} else if (i === 2) {
			span.innerHTML = "Information Objects";
			span.style.bottom = "43%";
		} else if (i === 4) {
			span.innerHTML = "Source Apps";
			span.style.top = "0px";
			row.style.borderTop = "4px solid rgba(255,255,255,0.3)";
		}

		row.appendChild(span);

		row.style.position = "absolute";
		row.style.width = "100%";
		row.style.height = "20%";

		swimlanes.push(row);
	}

	swimlanes[0].style.top = "0%";
	
	swimlanes[1].style.top = "20%";
	swimlanes[1].style.backgroundColor = "rgba(255,255,255,0.3)";
	swimlanes[1].style.padding = "0px 20p";

	swimlanes[2].style.top = "40%";
	
	swimlanes[3].style.top = "60%";
	
	swimlanes[4].style.top = "80%";

	for(let i = 0; i < swimlanes.length; i++) {
		swimlaneContainer.appendChild(swimlanes[i]);
	}


	container.appendChild(swimlaneContainer);
	// Add swimlanes to the 'graph' object so we can fetch it from other methods
	graph.swimlanes = swimlaneContainer;
	
}

/**
 * Initializes the stylesheet of all cells
 * @param  {mxGraph} graph The mxGraph object
 */
function configureStylesheet(graph) {
	let style = {};
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
	style[mxConstants.STYLE_STROKECOLOR] = "none";
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_FONTCOLOR] = styleConstants.cell.t1.color;
	style[mxConstants.STYLE_FONTSIZE] = styleConstants.cell.t1.fontSize;
	style[mxConstants.STYLE_OVERFLOW] = "hidden";

	style[mxConstants.STYLE_FILLCOLOR] = styleConstants.cell.backgroundColor;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_IMAGE_WIDTH] = styleConstants.cell.width / 3;
	style[mxConstants.STYLE_IMAGE_HEIGHT] = styleConstants.cell.width / 3;
	style[mxConstants.STYLE_SPACING_TOP] = "46";
	style[mxConstants.STYLE_SPACING] = "2";

	let targetStyle = mxUtils.clone(style);
	targetStyle[mxConstants.STYLE_IMAGE] = "./assets/images/target-white.svg";
	graph.getStylesheet().putCellStyle("target", targetStyle);


	let sourceStyle = mxUtils.clone(style);
	sourceStyle[mxConstants.STYLE_IMAGE] = "./assets/images/database-white.svg";
	graph.getStylesheet().putCellStyle("source", sourceStyle);

	let microflowStyle = mxUtils.clone(style);
	microflowStyle[mxConstants.STYLE_IMAGE] = "./assets/images/MicroFlow.svg";
	graph.getStylesheet().putCellStyle("microflow", microflowStyle);

	let flowStyle = mxUtils.clone(style);
	flowStyle[mxConstants.STYLE_IMAGE] = "./assets/images/Integration-white.svg";
	flowStyle[mxConstants.STYLE_IMAGE_WIDTH] = style[mxConstants.STYLE_IMAGE_WIDTH] * 1.1;
	graph.getStylesheet().putCellStyle("flow", flowStyle);

	// Title1 = the title on the cel ('information'/'app' ) 
	style = {};
	style[mxConstants.STYLE_FONTCOLOR] = "#FFFFFF";
	style[mxConstants.STYLE_FONTSIZE] = styleConstants.cell.t2.fontSize;
	style[mxConstants.STYLE_FONTCOLOR] = styleConstants.cell.t2.color;
	style[mxConstants.STYLE_OVERFLOW] = "hidden";
	graph.getStylesheet().putCellStyle("title2", style);

	// Edge style
	style = graph.getStylesheet().getDefaultEdgeStyle();
	style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = "#FFFFFF";
	style[mxConstants.STYLE_ENDARROW] = "none";
	style[mxConstants.STYLE_STROKEWIDTH] = "2";
	style[mxConstants.STYLE_STROKECOLOR] = styleConstants.cell.backgroundColor;
	style[mxConstants.STYLE_ROUNDED] = false;
	style[mxConstants.STYLE_EDGE] = mxEdgeStyle.TopToBottom;
}
