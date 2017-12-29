import $ from "jquery";
export function createFlow(data) {
	return {
		type: "CREATE_FLOW",
		payload: data,
	};
}

export function removeFlow(flow) {
	return {
		type: "REMOVE_FLOW",
		payload: flow,
	};
}

export function updateFlows(flows) {
	return {
		type: "UPDATE_FLOW",
		payload: flows,
	};
}

export function FlowPopup(title, flowObj){

	if(!document.getElementById("removeflow_popup")){
	// Give 2 options. Delete all WITH microflows, target and source apps or JUST the Flow box 
		
		var outer_box = document.createElement("div");
		var inner_box = document.createElement("div");
		outer_box.setAttribute("id", "removeflow_popup");
		var inner_box_title = document.createElement("h4");
		inner_box_title.innerHTML = "WARNING...!!!"
		var close_span = document.createElement("span");
		close_span.innerHTML = "X";
		close_span.setAttribute("id", "removeflow_btn_cls");
		inner_box_title.appendChild(close_span);
		inner_box.appendChild(inner_box_title);
		var inner_box_body = document.createElement("container");

		var inner_box_label_1 = document.createElement("label");
		var span = document.createElement("span");
		span.innerHTML = "Do you want to delete the flow and all it's connections ?";
		var radio = document.createElement("input");
		radio.type = "radio";
		radio.name = "radio_flow";
		radio.value = "connection";
		inner_box_label_1.appendChild(radio);
		inner_box_label_1.appendChild(span);
		inner_box_body.appendChild(inner_box_label_1);

		var inner_box_label_2 = document.createElement("label");
		var span = document.createElement("span");
		span.innerHTML = "Do you want to delete only the Flow-box ?";
		var radio = document.createElement("input");
		radio.type = "radio";
		radio.name = "radio_flow";
		radio.value = "flow_only";
		inner_box_label_2.appendChild(radio);
		inner_box_label_2.appendChild(span);
		inner_box_body.appendChild(inner_box_label_2);

		var button = document.createElement("button");
		var text = document.createTextNode("Ok");
		button.appendChild(text);
		button.setAttribute("id", "removeflow_btn");

		inner_box.appendChild(inner_box_body);
		outer_box.appendChild(inner_box);
		inner_box.appendChild(button);

		document.getElementById("app").appendChild(outer_box);


		document.getElementById("removeflow_btn_cls").addEventListener("click", function(event) {
			// Remove Popup
			var element = document.getElementById("removeflow_popup")
			element.remove();
		});

		document.getElementById("removeflow_btn").addEventListener("click", function(event) {
			if(($('input[name="radio_flow"]:eq(0)').prop("checked")) || ($('input[name="radio_flow"]:eq(1)').prop("checked"))){
				CheckFlow(title);
				flowObj.props.removeFlow(title);
			}
		});
	}
return true;
}


export function CheckFlow(flowTitle) {
	//Remove the flow summary
	let allCells = window.graph.model.cells;
	var radios = document.getElementsByName('radio_flow');
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked && radios[i].value == "flow_only") {

			//Removes all Microflows
			let flows = JSON.parse(window.localStorage.flows);
			let flow = flows[flowTitle];
			if(flow){
				let micro_flows = flow.microflows;
				for(var m=0; m<micro_flows.length; m++){
					var cell = window.graph.model.getCell(micro_flows[m]);
					window.graph.removeCells([cell]);
				}
				var cells = graph.getModel().getCell("flowLayer").children;
				for(var k=0; k<cells.length; k++){
					var cell_title = cells[k].getAttribute("title");
					
					if( cell_title == flowTitle ){
						window.graph.removeCells([cells[k]]);
					}
				}
			}

		}else if( radios[i].checked && radios[i].value == "connection" ){

			let flows = JSON.parse(window.localStorage.flows);
			var cellsArray = GetCellArray(flows);
			//Delete all WITH microflows, target and source apps
			let flow = flows[flowTitle];
			if(flow){
				var node_ids = flow.nodeIDs;

				for(var k=0; k<node_ids.length; k++){
					var cell = window.graph.model.getCell(node_ids[k]);
					var numOccurences = $.grep(cellsArray, function (elem) {
						return elem === cell.id;
					}).length;

					if(numOccurences == 1 || cell.style == "microflow"){
						window.graph.removeCells([cell]);
					}
				}
			}
		}
	}
}	

export function GetCellArray(flows){
	var cellsArray = [];
	for ( var key in flows ) {
		var node_ids = flows[key].nodeIDs;
		for(var k=0; k<node_ids.length; k++){
			 cellsArray.push(node_ids[k])
		}
	}
	return cellsArray;
}