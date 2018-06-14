export function summarize(data) {
	const summarized = {};
	const root = data.mxGraphModel.root;
	let flows = [];
	let targets = [];
	let sources = [];

	// MicroFlows
	let experiences = [];
	let processes = [];
	let informations = [];

	let cells = [];
	const edges = [];

	if (root.Flow) {
		if (root.Flow.length) {flows = root.Flow;} else {flows.push(root.Flow);}
	}
	if (root.Target) {
		if (root.Target.length) {targets = root.Target;} else {targets.push(root.Target);}
	}
	if (root.Source) {
		if (root.Source.length) {sources = root.Source;} else {sources.push(root.Source);}
	}

	if (root.Experience) {
		if (root.Experience.length) {experiences = root.Experience;} else {experiences.push(root.Experience);}
	}
	if (root.Process) {
		if (root.Process.length) {processes = root.Process;} else {processes.push(root.Process);}
	}
	if (root.Information) {
		if (root.Information.length) {informations = root.Information;} else {informations.push(root.Information);}
	}


	if (root.mxCell) {
		if (root.mxCell.length) {cells = root.mxCell;} else {cells.push(root.mxCell);}
	}


	const allCells = {};

	for (let i = 0; i < cells.length; i++) {
		if (cells[i]._attributes.edge) {edges.push(cells[i]);}
	}

	// All cells
	for (let i = 0; i < flows.length; i++) {
		const cell = flows[i];
		cell.type = "flow";
		allCells[cell._attributes.id] = cell;
	}
	for (let i = 0; i < targets.length; i++) {
		const cell = targets[i];
		cell.type = "target";
		allCells[cell._attributes.id] = cell;
	}
	for (let i = 0; i < sources.length; i++) {
		const cell = sources[i];
		cell.type = "source";
		allCells[cell._attributes.id] = cell;
	}

	for (let i = 0; i < experiences.length; i++) {
		const cell = experiences[i];
		cell.type = "experience";
		allCells[cell._attributes.id] = cell;
	}
	for (let i = 0; i < informations.length; i++) {
		const cell = informations[i];
		cell.type = "information";
		allCells[cell._attributes.id] = cell;
	}
	for (let i = 0; i < processes.length; i++) {
		const cell = processes[i];
		cell.type = "process";
		allCells[cell._attributes.id] = cell;
	}


	if (edges.length === 0) {
		return summarized;
	}


	// start clustering
	for(let i = 0; i < flows.length; i++) {
		let flow = flows[i];
		let flowID = flow._attributes.id;
		summarized[i] = {
			title: flow._attributes.title,
			description: "Default description",
			nodeIDs: [],
		};

		// Add all nodes directly connected to the root node
		let oneNeighborhood = findNeighbours(flowID);
		console.log(oneNeighborhood);
		let twoNeighborhood = [];

		for(let j = 0; j < oneNeighborhood.length; j++) {
			let ID = oneNeighborhood[i];
			let nodeNeighbors = findNeighbours(ID);
			twoNeighborhood = [...twoNeighborhood, ...nodeNeighbors];
		}
		summarized[i].nodeIDs = [...oneNeighborhood, ...twoNeighborhood];

	}

	/**
	 * Finds the one ring neighborhood of a given node
	 * @param {id of the node find it's neigborhood} id 
	 */
	function findNeighbours(id) {
		let neighbors = [];
		
		for(let i = 0; i < edges.length; i++) {
			let edge = edges[i];
			let s = edge._attributes.source;
			let t = edge._attributes.target;

			// Add cell to neighbors if source or target off the edge is connected to node[ID]
			if(s === id ) {

				neighbors.push(t);
				
			} else if( t === id ) {
				
				neighbors.push(s);
				
			}	
			
		}

		return neighbors;
	}

	// Output:
	/*
	{
		"A": {
			"title":"A",
			"description":"Default description",
			"nodeIDs":["6","4"]
		},
		"B": {
			"title":"B",
			"description":"Default description",
			"nodeIDs":["10","12","14"]
		}
	}
	*/


	return summarized;
}
