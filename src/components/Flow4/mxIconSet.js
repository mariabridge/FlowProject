
// Defines a new class for all icons
export function mxIconSet(state) {

	let img;

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
	img = mxUtils.createImage("./assets/images/cross.svg");
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
			graph.removeCells([state.cell]);
			mxEvent.consume(evt);
			this.destroy();
		})
	);

	state.view.graph.container.appendChild(img);
	this.images.push(img);
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

export function initMxIconSet(graph) {
	const iconTolerance = 20;

	graph.addMouseListener({
		currentState: null,
		currentIconSet: null,
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
        		if (isLabel) return;
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
		mouseUp: function() { },
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
		},
	});
}
