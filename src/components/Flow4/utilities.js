/**
 * Utility functions used by the graph
 */

import { uniq, forEach, remove, isEmpty } from "lodash";
import { styleConstants } from "./constants.js";
import axios from "axios";
import { browserHistory } from 'react-router';// In react-router v3 only

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
	buildFlowGraph:buildFlowGraph,
	StoreFlowGraph:StoreFlowGraph,
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
 * Store Flow Graph Into DB
 * @param {mxGraph} graph   The mxGraph object
 */
function StoreFlowGraph(project_name) {
	let allCells = window.graph.model.cells;
	let cellObj = [];
	
	console.log(allCells);
	let flows = JSON.parse(window.localStorage.flows);

	console.log(flows);
	forEach(flows, function(value, key) {
		var descrip = value.description;
		if (value.nodeIDs.length) {
			// Target and Source & Microflows
			for(var n=0; n<value.nodeIDs.length; n++){
				var node_ID = value.nodeIDs[n];
				for(let i = 0; i < Object.keys(allCells).length; i++) {
					let key = Object.keys(window.graph.model.cells)[i];
					let node = allCells[key];

					if( node.id == node_ID ){
						
						console.log("node");
						console.log(node);
						let graphcell ={};
			
						graphcell['x'] = node.geometry.x;
						graphcell['y'] = node.geometry.y;
						graphcell['width'] = node.geometry.width;
						graphcell['height'] = node.geometry.height;
						graphcell['cell_id'] = parseInt(node.id);
						graphcell['title'] = node.getAttribute("title");
						graphcell['type'] = node.value.nodeName;
						graphcell['style'] = node.style;
						graphcell['desc'] = descrip;
						
						var endPoints = [];

						console.log("Edges");
						console.log(node.edges);
						if(node.edges){
							for(let j =0; j< node.edges.length; j++){
								if(node.edges[j].source.id != node.id)
								endPoints.push( node.edges[j].source.id);
							}
						}
						graphcell['endPoints'] = endPoints;
						cellObj.push(graphcell);
						
					}
				}
			}
		}
	});
	
	axios.post( '/api/post/project', {project_name :project_name, flowObj : cellObj} ).then(function(response){
		
		if(response.data.code == "ER_DUP_ENTRY"){
			console.log("ER_DUP_ENTRY");
			browserHistory.push('/dashboard'); // In react-router v3 only
		}
		else
		{
			console.log("Else");
			browserHistory.push("/flowhow4");
		}
		
	}).catch(function(error){
		console.log("error");
	});

}

/**
 * Create flow graph demo
 * @param {mxGraph} graph   The mxGraph object
 * @param {DOM Element} sidebar The DOM container
 * @param {xml-node} node    XML-node layout
 */
function buildFlowGraph(graph, nodes) {
	
	let title2 = null;
	let node = null;
	let nodeX = null;
	let nodeY = null;
	let nodeStyle = "target";
	let width = 100;
	let height = 100;
	let nodeId = null;

	let endPoints = [];
	let connections = [];

	let parent = graph.getDefaultParent();

	// Function that is executed when the image is dropped on
	// the graph. The cell argument points to the cell under
	// the mousepointer if there is one.
	
console.log(nodes);
	for( let i=0; i<nodes.length; i++)
	{
		node = nodes[i];
		nodeX = parseFloat(node.getAttribute("x"));
		nodeY = parseFloat(node.getAttribute("y"));
		nodeStyle = node.getAttribute("style");
		title2 = node.getAttribute("title");
		nodeId = node.getAttribute("id");
		endPoints = node.getAttribute("endPoints");


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
			v1 = graph.insertVertex(parent, null, newNode, nodeX, nodeY, width, height, nodeStyle);
	
			// Adds a child vertex to v1 which is the name of the node
			const label = graph.insertVertex(v1, null, title2, 0.5, 0.85, 0, 0, "title2", true );
			label.setConnectable(false);
			v1.setConnectable(true);

			// Presets the collapsed size
			v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);

			connections[nodeId] = v1;

		} finally {
			model.endUpdate();


		}

		//graph.setSelectionCell(v1);
	}


	for( let j=0; j<nodes.length; j++)
	{

		
		node = nodes[j];

		nodeId = node.getAttribute("id");
		endPoints = node.getAttribute("endPoints");


		const model = graph.getModel();
		
		parent = graph.getDefaultParent();

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
			var e1 = null;
			if(endPoints)
			{
				console.log("nodename"+node.nodeName);
				var endPointArray = endPoints.split(',');
				console.log(endPointArray);
				for( let k=0; k<endPointArray.length;k++)
				{
					var e1 = graph.insertEdge(parent, null, '', connections[nodeId], connections[parseInt(endPointArray[k])]);
				}
			}
			
		} finally {
			model.endUpdate();
		}

		//graph.setSelectionCell(v1);
	}
	
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
		image = "../../assets/images/target-white.svg";
		style = "target";
		title1 = "App";
		title2 = "Target";
	} else if (node.nodeName === "Flow") {
		image = "../../assets/images/Integration-white.svg";
		style = "flow";
		title1 = "Information";
		title2 = "Flow";
	} else if (node.nodeName === "Source") {
		image = "../../assets/images/database-white.svg";
		style = "source";
		title1 = "App";
		title2 = "Source";
	} else if (node.nodeName === "Experience") {
		image = "../../assets/images/MicroFlow.svg";
		style = "microflow";
		title1 = "Experience";
		title2 = "MicroFlow";
	} else if (node.nodeName === "Process") {
		image = "../../assets/images/MicroFlow.svg";
		style = "microflow";
		title1 = "Process";
		title2 = "MicroFlow";
	} else if (node.nodeName === "Information") {
		image = "../../assets/images/MicroFlow.svg";
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
		
		this.dragElement = this.createDragElement(evt);

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

			var highlighted = document.getElementsByClassName("highlighted")[0].id;
			if(!highlighted){
				var highlighted = document.getElementsByClassName("highlighted")[0].parentNode.id;
			}
			
			var cy,offset_top,div_height,y_position; 
			var offset_top = document.getElementsByClassName("highlighted")[0].offsetTop

			switch(highlighted) {
				case "swimlane-1":
					div_height = document.getElementById("swimlane-1").offsetHeight;
					cy = 0
					y_position = cy+35;
					break;
				case "swimlane-2":
					div_height = document.getElementById("swimlane-1").offsetHeight*2;
					cy = document.getElementById("swimlane-1").offsetHeight + offset_top + 20
					y_position = cy+13;
					break;
				case "swimlane-3":
					div_height = document.getElementById("swimlane-1").offsetHeight*3;
					cy = document.getElementById("swimlane-1").offsetHeight*2 + offset_top + 20
					y_position = cy+8;
					break;
				case "swimlane-4":
					div_height = document.getElementById("swimlane-1").offsetHeight*4;
					cy = document.getElementById("swimlane-1").offsetHeight*3 + offset_top
					y_position = cy+12;
					break;	
				case "swimlane-5":
					div_height = document.getElementById("swimlane-1").offsetHeight*4;
					cy = document.getElementById("swimlane-1").offsetHeight;
					var selected_height = document.getElementById("swimlane-5").offsetHeight
					var container_center = selected_height/2-(styleConstants.cell.height/3);
					y_position = cy+container_center+25;
					break;	
				case "swimlane-6":
					div_height = document.getElementById("swimlane-1").offsetHeight*6;
					cy = document.getElementById("swimlane-1").offsetHeight*4
					y_position = cy+35;
					break;	
				default:
					cy = 0
			}

			var Flowflag = false, FlowCountflag = false;;
			
			var div_style = parseFloat(styleConstants.cell.height) + y;
			if( y > cy && y < div_height && cy < div_height && ( div_height > div_style )){

				if ( node.nodeName === "Experience" || node.nodeName === "Process" || node.nodeName === "Information") {
					var commom_diff=0;
					// Adds Microflow into the Flow box
					const flow_background = document.getElementsByClassName("background_div");
					if(flow_background.length != 0 || flow_background.length != "0" ){
						for(let j = 0; j < flow_background.length; j++) {
							var background_left = flow_background[j].offsetLeft/0.86-20;
							var background_width = flow_background[j].offsetWidth;
							var background_right = (flow_background[j].offsetLeft/0.86)+background_width;
							//var cell_right = x+parseFloat(styleConstants.cell.width);
							var cell_half = (x+(parseFloat(styleConstants.cell.width)/2));

								if( (background_left <= x) && (background_right >= cell_half)) {	
								flow_background[j].id = "selected_flow";
								//var x_pos = x-10;
								v1 = graph.insertVertex(parent, null, newNode, x, y_position, styleConstants.cell.width, styleConstants.cell.height, style);

								// Adds a child vertex to v1 which is the name of the node
								const label = graph.insertVertex(v1, null, title2, 0.5, 0.78, 0, 0, "title2", true );
								label.setConnectable(false);
								v1.setConnectable(true);
								// Presets the collapsed size
								v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
								Flowflag = true;
								break;
							}
							
						}
						if(!Flowflag){
							alert("Please add Micro flows in the correct flow !!!")
						}
					}else{
						alert("Please add Flow before adding Micro flows !!!")
					}
				}
				else if( node.nodeName === "Flow" ){

					const flow_background = document.getElementsByClassName("background_div");
					var flows = graph.getModel().getCell("flowLayer").children;

					if(flows){
						if( flows.length != 0 || flows.length != "0" ){
							for(let j = 0; j < flow_background.length; j++) {
								var background_left = flow_background[j].offsetLeft/0.86-20;
								var background_width = flow_background[j].offsetWidth;
								var background_right = (flow_background[j].offsetLeft/0.86)+background_width+15;

								var cell_half = (x+(parseFloat(styleConstants.cell.width)/2));
								if( ((background_left >= x) && (background_left >= x+100)) || (background_right <= x) ){
									//break
								}else{
									FlowCountflag = true;
									break;
								}
							}

							if(!FlowCountflag){
								v1 = graph.insertVertex(parent, null, newNode, x, y_position, styleConstants.cell.width, styleConstants.cell.height, style);
								// Adds a child vertex to v1 which is the name of the node
								const label = graph.insertVertex(v1, null, title2, 0.5, 0.78, 0, 0, "title2", true );
								label.setConnectable(false);
								v1.setConnectable(true);
								// Presets the collapsed size
								v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
							}


						}else{
							v1 = graph.insertVertex(parent, null, newNode, x, y_position, styleConstants.cell.width, styleConstants.cell.height, style);
							// Adds a child vertex to v1 which is the name of the node
							const label = graph.insertVertex(v1, null, title2, 0.5, 0.78, 0, 0, "title2", true );
							label.setConnectable(false);
							v1.setConnectable(true);
							// Presets the collapsed size
							v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
						}
					}else{
						v1 = graph.insertVertex(parent, null, newNode, x, y_position, styleConstants.cell.width, styleConstants.cell.height, style);
						// Adds a child vertex to v1 which is the name of the node
						const label = graph.insertVertex(v1, null, title2, 0.5, 0.78, 0, 0, "title2", true );
						label.setConnectable(false);
						v1.setConnectable(true);
						// Presets the collapsed size
						v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
					}
				}

				else{
					v1 = graph.insertVertex(parent, null, newNode, x, y_position, styleConstants.cell.width, styleConstants.cell.height, style);
					// Adds a child vertex to v1 which is the name of the node
					const label = graph.insertVertex(v1, null, title2, 0.5, 0.78, 0, 0, "title2", true );
					label.setConnectable(false);
					v1.setConnectable(true);
					// Presets the collapsed size
					v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
				}
				
			}else{
				
				/*var element = document.getElementById("microflow_popup")
				element.remove();*/

				//Is the popup shows the reason for why user cant dragg the box outside the related container
				if(document.getElementById("popup_block")){
					var element = document.getElementById("popup_block")
					element.parentNode.removeChild(element);
				}
				var div = document.createElement("div");
				var span = document.createElement("label");
				div.setAttribute("id", "popup_block");
				div.appendChild(span);
				span.innerHTML = "You tried placing the component in an invalid container. Try dragging to the highlighted area.";
				document.getElementById("app").appendChild(div);

				setTimeout(()=>{
					div.setAttribute("class", "fade");
				}, 3000);
				setTimeout(()=>{
					if(document.getElementById("popup_block")){
						var element = document.getElementById("popup_block")
						element.parentNode.removeChild(element);
					}
				}, 3500);
			}
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

	/*div.style.width = styleConstants.cell.width;
	div.style.height = styleConstants.cell.height;
	div.style.margin = "auto";
	div.style.marginBottom = "20px";
	div.style.padding = "15px";
	div.style.backgroundColor = "rgba(255,255,255,0.1)";
	div.style.cursor = "pointer";
	div.style.position = "relative";
	*/
	div.setAttribute("nodeType", title1 + title2);
	
	if (title2 === "MicroFlow") {
    	div.className = "microflow-drag-element";
	} else if (title2 === "Flow") {
    	div.className = "flow-drag-element";
	}else if (title2 === "Target") {
		div.className = "flow-target-element";
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
	plus.style.fontSize = "35px";
	plus.style.left = "10";
	plus.style.top = "-5";


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
	targetStyle[mxConstants.STYLE_IMAGE] = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4yLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGFnZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAyODAuNCAyODYuOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjgwLjQgMjg2Ljk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOiNGRkZGRkY7fQ0KPC9zdHlsZT4NCjx0aXRsZT5DdXN0b21lcl8xPC90aXRsZT4NCjxnIGlkPSJMYWdlcl8yIj4NCgk8ZyBpZD0iTGFnZXJfMS0yIj4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE0MSwxMjMuNWMtMzAuMSwyNS4zLTc0LDI1LjMtMTA0LjEsMEMxMy43LDE0NCwwLDE3Ni44LDAsMjExLjhjLTAuMSwyMC41LDQuOCw0MC44LDE0LjMsNTkNCgkJCWM5LjksMS4zLDE5LjksMi40LDI5LjksMy4yYzE0LjgsMS4yLDI5LjksMS44LDQ0LjgsMS44czMwLTAuNiw0NC44LTEuOGM5LjktMC44LDIwLTEuOSwyOS45LTMuMmM5LjUtMTguMiwxNC40LTM4LjUsMTQuMy01OQ0KCQkJQzE3Ny45LDE3Ni44LDE2NC4yLDE0NCwxNDEsMTIzLjV6Ii8+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04OC45LDEyMy4yYzM0LDAsNjEuNi0yNy42LDYxLjYtNjEuNlMxMjIuOSwwLDg4LjksMFMyNy4zLDI3LjYsMjcuMyw2MS42QzI3LjMsOTUuNiw1NC45LDEyMy4xLDg4LjksMTIzLjJ6Ig0KCQkJLz4NCgk8L2c+DQo8L2c+DQo8ZyBpZD0iTGFnZXJfMl8xXyI+DQoJPGcgaWQ9IkxhZ2VyXzEtMl8xXyI+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xOTIuNiwyNzcuNmMtNC40LDAtOC00LjEtOC05LjJsMCwwVjEzNi43YzAtNSwzLjYtOS4yLDgtOS4yaDc2LjFjNC40LDAsOCw0LjEsOCw5LjJsMCwwdjEzMS44DQoJCQljMCw1LTMuNiw5LjItOCw5LjJsMCwwdi0wLjVjNC4xLDAsNy41LTMuOSw3LjUtOC43bDAsMFYxMzYuN2MwLTQuOC0zLjQtOC43LTcuNS04LjdoLTc2LjFjLTQuMSwwLTcuNSwzLjktNy41LDguN2wwLDB2MTMxLjgNCgkJCWMwLDQuOCwzLjQsOC43LDcuNSw4LjdoNzYuMXYwLjVIMTkyLjZ6Ii8+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNjguNywxMjMuOWgtNzYuMWMtNi40LDAtMTEuNiw1LjctMTEuNiwxMi44djEzMS44YzAsNy4xLDUuMiwxMi44LDExLjYsMTIuOGg3Ni4xYzYuNCwwLDExLjYtNS43LDExLjYtMTIuOA0KCQkJVjEzNi43QzI4MC40LDEyOS42LDI3NS4yLDEyMy45LDI2OC43LDEyMy45eiBNMjYwLjksMjcyLjJoLTUuMmMtMi45LDAtNS4yLTIuMy01LjItNS4yczIuMy01LjIsNS4yLTUuMmg1LjINCgkJCWMyLjksMCw1LjIsMi4zLDUuMiw1LjJTMjYzLjcsMjcyLjIsMjYwLjksMjcyLjJ6IE0yNjkuOCwyNDQuNWMwLDMuNS0yLjYsNi40LTUuOCw2LjRoLTY2LjZjLTMuMiwwLTUuOC0yLjktNS44LTYuNFYxNDINCgkJCWMwLTMuNSwyLjYtNi40LDUuOC02LjRIMjY0YzMuMiwwLDUuOCwyLjksNS44LDYuNEwyNjkuOCwyNDQuNXoiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==";
	graph.getStylesheet().putCellStyle("target", targetStyle);


	let sourceStyle = mxUtils.clone(style);
	sourceStyle[mxConstants.STYLE_IMAGE] = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4yLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDE4OSAyNDEuNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTg5IDI0MS43OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZGlzcGxheTpub25lO30NCgkuc3Qxe2Rpc3BsYXk6aW5saW5lO2ZpbGw6IzlCOUI5Qjt9DQoJLnN0MntmaWxsOiNGRkZGRkY7fQ0KPC9zdHlsZT4NCjxnIGlkPSJMYWdlcl8yXzFfIiBjbGFzcz0ic3QwIj4NCgk8cmVjdCB4PSIwIiBjbGFzcz0ic3QxIiB3aWR0aD0iMTg5IiBoZWlnaHQ9IjI0MS43Ii8+DQo8L2c+DQo8ZyBpZD0iTGFnZXJfMSI+DQoJPHRpdGxlPkRhdGFiYXNlPC90aXRsZT4NCgk8ZyBpZD0iTGFnZXJfMiI+DQoJCTxnIGlkPSJMYWdlcl8xLTIiPg0KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE4MC4zLDE2MS4xYy0xNSwxMS42LTQ3LjgsMTkuNy04NS44LDE5LjdzLTcwLjgtOC4xLTg1LjgtMTkuN2MtNS42LDQuMy04LjcsOS4xLTguNywxNC4yDQoJCQkJYzAsMTguNyw0Mi4zLDMzLjksOTQuNSwzMy45UzE4OSwxOTQsMTg5LDE3NS4zQzE4OSwxNzAuMiwxODUuOSwxNjUuNCwxODAuMywxNjEuMXoiLz4NCgkJCTxlbGxpcHNlIGNsYXNzPSJzdDIiIGN4PSI5NC41IiBjeT0iMzMuOSIgcng9Ijk0LjUiIHJ5PSIzMy45Ii8+DQoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMTc5LjksMTIyLjNjLTE1LjIsMTEuNS00Ny43LDE5LjQtODUuNCwxOS40cy03MC4yLTcuOS04NS40LTE5LjRjLTUuOCw0LjQtOS4xLDkuMy05LjEsMTQuNQ0KCQkJCWMwLDE4LjcsNDIuMywzMy45LDk0LjUsMzMuOXM5NC41LTE1LjIsOTQuNS0zMy45QzE4OSwxMzEuNiwxODUuNywxMjYuNywxNzkuOSwxMjIuM3oiLz4NCgkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik02LjMsMTQ1LjNMMCwxMzYuOHYtMjdjMCwwLDIsOC4zLDEyLjQsMTQuOGMxMC41LDYuNCw2MSwyNi42LDYxLDI2LjZzMzEuNiwyLjYsMzQuMSwyLjZzMzUuNi03LjgsMzYuMS03LjkNCgkJCQlzMzMuMy0xOC4yLDMzLjMtMTguMnYtMi44YzAsMCwxMS43LTUuNCwxMi4xLTE1LjF2MjdsLTQ0LjYsMjFsLTk0LjctMi43TDYuMywxNDUuM3oiLz4NCgkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xODAuMyw5MC4xYy0xNSwxMS42LTQ3LjgsMTkuNy04NS44LDE5LjdzLTcwLjgtOC04NS44LTE5LjdDMy4xLDk0LjQsMCw5OS4yLDAsMTA0LjMNCgkJCQljMCwxOC43LDQyLjMsMzMuOSw5NC41LDMzLjlTMTg5LDEyMywxODksMTA0LjNDMTg5LDk5LjIsMTg1LjksOTQuNCwxODAuMyw5MC4xeiIvPg0KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE3OS45LDE5My4zYy0xNS4yLDExLjQtNDcuNywxOS40LTg1LjQsMTkuNHMtNzAuMy03LjktODUuNC0xOS40Yy01LjgsNC40LTkuMSw5LjMtOS4xLDE0LjUNCgkJCQljMCwxOC43LDQyLjMsMzMuOSw5NC41LDMzLjlzOTQuNS0xNS4yLDk0LjUtMzMuOUMxODksMjAyLjcsMTg1LjcsMTk3LjcsMTc5LjksMTkzLjN6Ii8+DQoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNi4zLDIxNkwwLDIwNy41di0yN2MwLDAsMiw4LjQsMTIuNCwxNC44czYxLDI2LjYsNjEsMjYuNnMzMS42LDIuNiwzNC4xLDIuNnMzNS42LTcuOCwzNi4xLTcuOQ0KCQkJCXMzMy4zLTE4LjIsMzMuMy0xOC4ydi0yLjhjMCwwLDExLjctNS40LDEyLjEtMTUuMXYyN2wtNDQuNiwyMWwtOTQuNy0yLjdMNi4zLDIxNnoiLz4NCgkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xODAuNSw1Mi40bC0wLjYtMC41Yy0xNS4yLDExLjQtNDcuNywxOS40LTg1LjQsMTkuNGMtMjguNCwwLTU0LTQuNS03MS4zLTExLjZjLTMuNy0xLjYtNy4zLTMuNC0xMC44LTUuNA0KCQkJCWwtMC4xLTAuMWwtMC41LTAuM2wtMS0wLjdDMS44LDQ2LjksMCwzOS40LDAsMzkuNHYyN2MwLDE4LjcsNDIuMywzMy45LDk0LjUsMzMuOVMxODksODUuMSwxODksNjYuNHYtMjcNCgkJCQlDMTg4LjgsNDUuNSwxODQsNTAsMTgwLjUsNTIuNHoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K";
	graph.getStylesheet().putCellStyle("source", sourceStyle);

	let microflowStyle = mxUtils.clone(style);
	microflowStyle[mxConstants.STYLE_IMAGE] = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4yLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDY0IDY0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2NCA2NDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2Rpc3BsYXk6bm9uZTt9DQoJLnN0MXtkaXNwbGF5OmlubGluZTtmaWxsOiM2RTZFNkQ7fQ0KCS5zdDJ7ZmlsbDojRkZGRkZGO30NCjwvc3R5bGU+DQo8ZyBpZD0iTGFnZXJfMSIgY2xhc3M9InN0MCI+DQoJPHJlY3QgeD0iMCIgY2xhc3M9InN0MSIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ii8+DQo8L2c+DQo8ZyBpZD0iTGFnZXJfMiI+DQoJPGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzIiIGN5PSIyOC4xIiByPSIyOC4xIi8+DQoJPHJlY3QgeD0iMjUuOSIgeT0iNTIuNiIgY2xhc3M9InN0MiIgd2lkdGg9IjEyLjQiIGhlaWdodD0iMTEuNCIvPg0KPC9nPg0KPC9zdmc+DQo=";
	graph.getStylesheet().putCellStyle("microflow", microflowStyle);

	let flowStyle = mxUtils.clone(style);
	flowStyle[mxConstants.STYLE_IMAGE] = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4yLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGFnZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAzNDAuNyAzMDMuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzQwLjcgMzAzLjI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOiNGRkZGRkY7fQ0KPC9zdHlsZT4NCjx0aXRsZT5JbnRlZ3JhdGlvbjwvdGl0bGU+DQo8ZyBpZD0iTGFnZXJfMiI+DQoJPGcgaWQ9IkxhZ2VyXzEtMiI+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yOTIuOCwxNTkuOGMtMjYuNCwwLTQ3LjgsMjEuNC00Ny44LDQ3LjhjMCwyNi40LDIxLjQsNDcuOCw0Ny44LDQ3LjhjMjYuNCwwLDQ3LjgtMjEuNCw0Ny44LTQ3LjgNCgkJCUMzNDAuNiwxODEuMiwzMTkuMiwxNTkuOCwyOTIuOCwxNTkuOHoiLz4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE2OS4zLDIwNy42Yy0yNi40LDAtNDcuOCwyMS40LTQ3LjgsNDcuOHMyMS40LDQ3LjgsNDcuOCw0Ny44czQ3LjgtMjEuNCw0Ny44LTQ3LjhsMCwwDQoJCQlDMjE3LjEsMjI5LDE5NS43LDIwNy42LDE2OS4zLDIwNy42eiIvPg0KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDcuOCwxNTkuOEMyMS40LDE1OS44LDAsMTgxLjIsMCwyMDcuNnMyMS40LDQ3LjgsNDcuOCw0Ny44czQ3LjgtMjEuNCw0Ny44LTQ3LjgNCgkJCUM5NS42LDE4MS4yLDc0LjIsMTU5LjgsNDcuOCwxNTkuOHoiLz4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTI1OC41LDE2MS4xbC0xOC44LTE4LjhjMjkuNi0zOS4xLDIxLjktOTQuNy0xNy4yLTEyNC4zUzEyNy43LTMuOSw5OC4xLDM1LjJDNzQsNjcsNzQuMiwxMTEuMSw5OC41LDE0Mi44DQoJCQlsLTE4LjMsMTguM2M3LjcsNS45LDEzLjksMTMuNSwxOC4yLDIyLjNsMjEtMjFjMTAuNiw3LjIsMjIuNiwxMS45LDM1LjIsMTR2MjZjOS40LTIuMywxOS4yLTIuMywyOC42LDB2LTI2DQoJCQljMTIuOC0yLjEsMjUuMS03LDM1LjgtMTQuNGwyMS40LDIxLjRDMjQ0LjUsMTc0LjYsMjUwLjgsMTY3LDI1OC41LDE2MS4xeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K";
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
