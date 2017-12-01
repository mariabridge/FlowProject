import { FlowPopup } from "../../actions/flowHowActions";

var toolTips = [];
// Defines a new class for all icons
export function mxIconSet(state) {

	let img;
	const label = state.cell.getAttribute("title", "");
	
	this.images = [];
	const graph = state.view.graph;

	// // Move
	// img = mxUtils.createImage('./move.svg');
	// img.setAttribute('title', 'Move');
	// img.style.position = 'absolute';
	// img.style.cursor = 'move';
	// img.style.width = '16px';
	// img.style.height = '16px';
	// img.style.left = (state.x + 4 ) + 'px';
	// img.style.top = (state.y + 4 ) + 'px';

	// mxEvent.addGestureListeners(img,
	// 	mxUtils.bind(this, function(evt) {
	// 		graph.graphHandler.start(state.cell,
	// 			mxEvent.getClientX(evt), mxEvent.getClientY(evt));
	// 		graph.graphHandler.cellWasClicked = true;
	// 		graph.isMouseDown = true;
	// 		graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
	// 		mxEvent.consume(evt);
	// 		this.destroy();
	// 	})
	// );

	// state.view.graph.container.appendChild(img);
	// this.images.push(img);

	// Delete
	img = mxUtils.createImage("../../assets/images/cross.svg");
	img.setAttribute("title", "Delete");
	img.style.position = "absolute";
	img.style.cursor = "pointer";
	img.style.width = "16px";
	img.style.height = "16px";
	img.style.left = (state.x + state.width - 20) + "px";
	img.style.top = (state.y + 4) + "px";


	mxEvent.addGestureListeners(img,
		mxUtils.bind(this, function(evt) {
			// Disables dragging the image
			mxEvent.consume(evt);
		})
	);
	
	
		
	mxEvent.addListener(img, "click",
		mxUtils.bind(this, function(evt) {
			if(state.cell.style == "flow" && window.summaryClass){
				var flow_title = state.cell.value.getAttribute("title");
				FlowPopup(flow_title, window.summaryClass)
			}else{
				graph.removeCells([state.cell]);
				mxEvent.consume(evt);
				this.destroy();
			}

		})
	);

	state.view.graph.container.appendChild(img);
	this.images.push(img);
}

export function mxTooltipSet(state) {
	let toolTip;
	const graph = state.view.graph;
	const label = mxGraph.prototype.retunLabel(state.cell);
	
	if(label && label.length > 10 ){
		
		toolTip = document.createElement('div');
		toolTip.setAttribute("title", "Tooltip");
		toolTip.style.position = "absolute";
		toolTip.style.cursor = "pointer";
		toolTip.className = "tooltip_container";
		toolTip.style.left = (state.x + state.width + 50) + "px";
		toolTip.style.top = (state.y + -13) + "px";
		mxUtils.write(toolTip,label);

		state.view.graph.container.appendChild(toolTip);
		toolTips.push(toolTip);
	}
}

mxIconSet.prototype.destroy = function() {
	if (this.images !== null) {
		for (let i = 0; i < this.images.length; i++) {
			const img = this.images[i];
			img.parentNode.removeChild(img);
		}
	}

	this.images = null;
};

mxIconSet.prototype.toolTipdestroy = function() {
	if (toolTips.length >0) {
		for (let i = 0; i < toolTips.length; i++) {
			const img = toolTips[i];
			img.parentNode.removeChild(img);
		}
	}	
	toolTips = [];	
};


export function initMxIconSet(graph) {
	const iconTolerance = 20;

	graph.addMouseListener({
		currentState: null,
		currentIconSet: null,
		//currentIconTooltip:null,
		mouseDown: function(sender, me) {
			// Hides icons on mouse down
			if (this.currentState !== null) {
				this.dragLeave(me.getEvent(), this.currentState);
				this.currentState = null;
			}
		},
		mouseMove: function(sender, me) {
        	let tmp;
        	const cell = me.getCell();

        	// Dont show icons if it's a label
        	if (cell) {
				const isLabel = typeof(cell.getValue()) === "string";
        		if (isLabel) {
					if (this.currentIconTooltip !== null) {
						mxIconSet.prototype.toolTipdestroy();
						this.currentIconTooltip = null;
					}
					if (this.currentIconTooltip === null) {
						this.currentIconTooltip = new mxTooltipSet(me.getState());
					}
					return;
				}
				
        	}

			if (this.currentState !== null && (me.getState() === this.currentState || me.getState() === null)) {
				const tol = iconTolerance;
				tmp = new mxRectangle(me.getGraphX() - tol,
					me.getGraphY() - tol, 2 * tol, 2 * tol);

				if (mxUtils.intersects(tmp, this.currentState)) {
					return;
				}
			}

			tmp = graph.view.getState(me.getCell());

			// Ignores everything but vertices
			if (graph.isMouseDown || (tmp !== null && !graph.getModel().isVertex(tmp.cell))) {
				tmp = null;
			}

			if (tmp !== this.currentState) {
				if (this.currentState !== null) {
					this.dragLeave(me.getEvent(), this.currentState);
				}

				this.currentState = tmp;

				if (this.currentState !== null) {
					this.dragEnter(me.getEvent(), this.currentState);
				}
			}
		},
		mouseUp: function() { 
			if (this.currentIconTooltip !== null) {
				mxIconSet.prototype.toolTipdestroy();
				this.currentIconTooltip = null;
			}
		},
		dragEnter: function(evt, state) {
			if (this.currentIconSet === null) {
				this.currentIconSet = new mxIconSet(state);
			}
		},
		dragLeave: function() {
			if (this.currentIconSet !== null) {
				this.currentIconSet.destroy();
				this.currentIconSet = null;
			}
			if (this.currentIconTooltip !== null) {
				mxIconSet.prototype.toolTipdestroy();
				this.currentIconTooltip = null;
			}
		}
	});
}
