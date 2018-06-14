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
