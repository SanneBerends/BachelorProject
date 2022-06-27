/*  Interactive elements
 *  Model script
 *  Copyright 2016-2021 Harmen de Weerd
 *
 *  v1.0: Basic functionality for dragging and dropping images across a canvas
 *  v2.0: Added functionality for dragging and dropping any type of (visual) element across a canvas
 *	v2.1: Added resizing functionality
 *	v2.2: Added relative positioning mode
 */

GraphicsConstants = {
	RESIZE_AREA: 5,
	ACTION_NONE: 0,
	ACTION_DRAG: 1,

	ACTION_E_RESIZE: 2,
	ACTION_W_RESIZE: 4,
	ACTION_S_RESIZE: 8,
	ACTION_N_RESIZE: 16,

	ACTION_NE_RESIZE: 18,
	ACTION_NW_RESIZE: 20,
	ACTION_SE_RESIZE: 10,
	ACTION_SW_RESIZE: 12,

	MODE_ABSOLUTE: 100,
	MODE_RELATIVE: 101
};

function ImageElement(img) {
	this.image = img;
	this.rotation = 0;
	this.getWidth = function() {
		return this.image.width;
	};
	this.getHeight = function() {
		return this.image.height;
	};
	this.draw = function(ctx, x, y) {
		var centerX, centerY;
		centerX = Math.floor(this.image.width/2);
		centerY = Math.floor(this.image.height/2)
		ctx.save();
		ctx.translate(x + centerX, y + centerY);
		ctx.rotate(this.rotation);
		ctx.translate(-centerX, -centerY);
		ctx.drawImage(this.image, 0, 0);
		ctx.restore();
	};
}

function InteractiveElement(container, graphicsElem, x, y, mode = GraphicsConstants.MODE_ABSOLUTE) {
	this.elem = graphicsElem;
	this.mode = mode;
	this.x = x;
	this.y = y;
	this.active = true;
	this.getX = function() {
		if (this.mode == GraphicsConstants.MODE_RELATIVE) {
			return this.elem.x + this.x;
		}
		return this.x;
	};
	this.setX = function(newVal) {
		if (this.mode == GraphicsConstants.MODE_RELATIVE) {
			this.elem.x = newVal - this.x;
		} else {
			this.x = newVal;
		}
	};
	this.getY = function() {
		if (this.mode == GraphicsConstants.MODE_RELATIVE) {
			return this.elem.y + this.y;
		}
		return this.y;
	};
	this.setY = function(newVal) {
		if (this.mode == GraphicsConstants.MODE_RELATIVE) {
			this.elem.y = newVal - this.y;
		} else {
			this.y = newVal;
		}
	};
	this.repertoire = GraphicsConstants.ACTION_DRAG;
	this.isDraggable = function() {
		return (this.repertoire & GraphicsConstants.ACTION_DRAG) > 0;
	};
	this.isResizable = function() {
		return (this.repertoire & GraphicsConstants.ACTION_RESIZE) > 0;
	};
	this.dragOffsetX = 0;
	this.dragOffsetY = 0;
	this.currentAction = GraphicsConstants.ACTION_NONE;
	this.onResize = null;
	this.onDrag = null;
	this.onDragging = null;
	this.onDrop = null;
	this.getWidth = function () { 
		return this.elem.getWidth(); 
	};
	this.getHeight = function () { 
		return this.elem.getHeight(); 
	};
	this.draw =	function(ctx) {
		this.elem.draw(ctx, this.getX(), this.getY());
	};
	this.startAction = function(event) {
		this.reference = {x: event.target.mouse.x, y: event.target.mouse.y};
		this.originalDimensions = {x: this.getX(), y:this.getY(), width: this.getWidth(), height: this.getHeight()};
		this.currentAction = this.getLocalAction(event.target.mouse.x - this.getX(), event.target.mouse.y - this.getY());
		switch (this.currentAction) {
			case GraphicsConstants.ACTION_DRAG:
				if (this.onDrag && !this.onDrag(this, event)) {
					this.currentAction = GraphicsConstants.ACTION_NONE;
				}
				break;
			case GraphicsConstants.ACTION_SE_RESIZE:
			case GraphicsConstants.ACTION_SW_RESIZE:
			case GraphicsConstants.ACTION_S_RESIZE:
			case GraphicsConstants.ACTION_NW_RESIZE:
			case GraphicsConstants.ACTION_NE_RESIZE:
			case GraphicsConstants.ACTION_W_RESIZE:
			case GraphicsConstants.ACTION_S_RESIZE:
			case GraphicsConstants.ACTION_N_RESIZE:
			case GraphicsConstants.ACTION_E_RESIZE:
			if (this.onResize && !this.onResize(this, event, this.currentAction)) {
				this.currentAction = GraphicsConstants.ACTION_NONE;
			}
			break;
		}
	};
	this.endAction = function(event) {
		if (this.currentAction == GraphicsConstants.ACTION_DRAG && this.onDrop) {
			this.onDrop(this, event);
		}
		this.currentAction = GraphicsConstants.ACTION_NONE;
	};
	this.continueAction = function(event) {
		var x, y;
		x = event.target.mouse.x;
		y = event.target.mouse.y;
		if (this.constraints != null) {
			x = Math.min(this.constraints.right + this.reference.x, Math.max(this.constraints.left + this.reference.x, x));
			y = Math.min(this.constraints.bottom + this.reference.y, Math.max(this.constraints.top + this.reference.y, y));
		}
		if ((this.currentAction & GraphicsConstants.ACTION_DRAG) > 0) {
			this.setX(this.originalDimensions.x + x - this.reference.x);
			this.setY(this.originalDimensions.y + y - this.reference.y);
		} else {
			if ((this.currentAction & GraphicsConstants.ACTION_S_RESIZE) > 0) {
				this.elem.setHeight(this.originalDimensions.height + y - this.reference.y);
			}
			if ((this.currentAction & GraphicsConstants.ACTION_E_RESIZE) > 0) {
				this.elem.setWidth(this.originalDimensions.width + x - this.reference.x);
			}
			if ((this.currentAction & GraphicsConstants.ACTION_N_RESIZE) > 0) {
				this.setY(this.originalDimensions.y + y - this.reference.y);
				this.elem.setHeight(this.originalDimensions.height - y + this.reference.y);
			}
			if ((this.currentAction & GraphicsConstants.ACTION_W_RESIZE) > 0) {
				this.setX(this.originalDimensions.x + x - this.reference.x);
				this.elem.setWidth(this.originalDimensions.width - x + this.reference.x);
			}
		}
		this.elem.x = this.getX() - (this.mode == GraphicsConstants.MODE_RELATIVE ? this.x : 0);
		this.elem.y = this.getY() - (this.mode == GraphicsConstants.MODE_RELATIVE ? this.y : 0);
		if (this.onDragging) {
			this.onDragging(this, event.target);
		}
	};
	this.getActionLabel = function(x, y) {
		switch (this.getLocalAction(x,y)) {
			case GraphicsConstants.ACTION_W_RESIZE:
			case GraphicsConstants.ACTION_E_RESIZE:
				return "col-resize";
			case GraphicsConstants.ACTION_S_RESIZE:
			case GraphicsConstants.ACTION_N_RESIZE:
				return "row-resize";
			case GraphicsConstants.ACTION_NW_RESIZE:
				return "nw-resize";
			case GraphicsConstants.ACTION_NE_RESIZE:
				return "ne-resize";
			case GraphicsConstants.ACTION_SE_RESIZE:
				return "se-resize";
			case GraphicsConstants.ACTION_SW_RESIZE:
				return "sw-resize";
			case GraphicsConstants.ACTION_DRAG:
				return "pointer";
		}
	};
	this.getLocalAction = function(x, y) {
		if ((this.repertoire & GraphicsConstants.ACTION_W_RESIZE) > 0 && x < GraphicsConstants.RESIZE_AREA) {
			if ((this.repertoire & GraphicsConstants.ACTION_N_RESIZE) > 0 && y < GraphicsConstants.RESIZE_AREA) {
				return GraphicsConstants.ACTION_NW_RESIZE;
			} else if ((this.repertoire & GraphicsConstants.ACTION_S_RESIZE) > 0 && y > this.getHeight() - GraphicsConstants.RESIZE_AREA) {
				return GraphicsConstants.ACTION_SW_RESIZE;
			}
			return GraphicsConstants.ACTION_W_RESIZE;
		} else if ((this.repertoire & GraphicsConstants.ACTION_E_RESIZE) > 0 && x > this.getWidth() - GraphicsConstants.RESIZE_AREA) {
			if ((this.repertoire & GraphicsConstants.ACTION_N_RESIZE) > 0 && y < GraphicsConstants.RESIZE_AREA) {
				return GraphicsConstants.ACTION_NE_RESIZE;
			} else if ((this.repertoire & GraphicsConstants.ACTION_S_RESIZE) > 0 && y > this.getHeight() - GraphicsConstants.RESIZE_AREA) {
				return GraphicsConstants.ACTION_SE_RESIZE;
			}
			return GraphicsConstants.ACTION_E_RESIZE;
		} else if ((this.repertoire & GraphicsConstants.ACTION_N_RESIZE) > 0 && y < GraphicsConstants.RESIZE_AREA) {
			return GraphicsConstants.ACTION_N_RESIZE;
		} else if ((this.repertoire & GraphicsConstants.ACTION_S_RESIZE) > 0 && y > this.getHeight() - GraphicsConstants.RESIZE_AREA) {
			return GraphicsConstants.ACTION_S_RESIZE;
		}
		if (this.isDraggable) {
			return GraphicsConstants.ACTION_DRAG;
		}
	};
	if (container.addInteractiveElement) {
		container.addInteractiveElement(this);
	} else {
		console.warn("Interactive element added to a container without a mouseTracker.");
	}
}
