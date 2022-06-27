/*  Braitenberg vehicles
 *  Lightbulb script
 *  Copyright 2021 Harmen de Weerd
 */

bulbCanvas = document.createElement("canvas");

function bulbIntensity(x, y) {
	return Math.min(1, 10/Math.pow(Math.max(1, x*x + y*y), 0.5));
}

function initBraitenbergBulbCanvas(canvasWidth, canvasHeight) {
	bulbCanvas.width = 2*canvasWidth;
	bulbCanvas.height = 2*canvasHeight;
	var board = bulbCanvas.getContext("2d").getImageData(0, 0, bulbCanvas.width, bulbCanvas.height);
	for (var i = 0; i < canvasWidth; ++i) {
		for (var j = 0; j < canvasHeight; ++j) {
			var intensity = bulbIntensity(i, j);
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth + i))*4] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth + i))*4 + 1] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth + i))*4 + 2] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth + i))*4 + 3] = 255*intensity;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth - i))*4] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth - i))*4 + 1] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth - i))*4 + 2] = 255;
			board.data[((canvasHeight + j)*bulbCanvas.width + (canvasWidth - i))*4 + 3] = 255*intensity;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth + i))*4] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth + i))*4 + 1] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth + i))*4 + 2] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth + i))*4 + 3] = 255*intensity;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth - i))*4] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth - i))*4 + 1] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth - i))*4 + 2] = 255;
			board.data[((canvasHeight - j)*bulbCanvas.width + (canvasWidth - i))*4 + 3] = 255*intensity;
		}
	}
	bulbCanvas.getContext("2d").putImageData(board, 0, 0);
}

function BraitenbergBulb(x, y, size) {
	this.x = x;
	this.y = y;
	this.id = -1;
	this.size = size;
	this.active = true;
	this.intensity = 5;
	this.getWidth = function() {
		return this.size*2;
	};
	this.getHeight = function() {
		return this.size*2;
	};
	this.draw = function(canvas, obstacles) {
		if (!this.active) {
			return;
		}
		var ctx = canvas.getContext("2d");
		ctx.save();
		for (var obj = 0; obj < obstacles.length; ++obj) {
			var dist = Math.sqrt(Math.pow(this.x - obstacles[obj].x, 2) + Math.pow(this.y - obstacles[obj].y, 2))
			var dx = (this.y - obstacles[obj].y) / dist * obstacles[obj].getRadius();
			var dy = (this.x - obstacles[obj].x) / dist * obstacles[obj].getRadius();
			if (dist < obstacles[obj].getRadius()) {
				// Obstacle is obscuring bulb
				if (obstacles[obj].id != this.id) {
					ctx.clip();
				}
			} else if (Math.abs(dy) > Math.abs(this.y - obstacles[obj].y)) {
				if (this.x > obstacles[obj].x) {
					// Project onto x = 0, dy positive
					var path = new Path2D();
					path.moveTo(0, 0);
					path.lineTo(0, this.y - (this.y - obstacles[obj].y + dy) * this.x / (this.x - obstacles[obj].x - dx));
					path.lineTo(obstacles[obj].x + dx, obstacles[obj].y - dy);
					path.lineTo(obstacles[obj].x - dx, obstacles[obj].y + dy);
					path.lineTo(0, this.y - (this.y - obstacles[obj].y - dy) * this.x / (this.x - obstacles[obj].x + dx));
					path.lineTo(0, canvas.height);
					path.lineTo(canvas.width, canvas.height);
					path.lineTo(canvas.width, 0);
					path.closePath();
					ctx.clip(path);
				} else {
					// Project onto x = canvas.width, dy negative
					var path = new Path2D();
					path.moveTo(0,0);
					path.lineTo(0, canvas.height);
					path.lineTo(canvas.width, canvas.height);
					path.lineTo(canvas.width, this.y + (this.y - obstacles[obj].y + dy) * (canvas.width - this.x) / (this.x - obstacles[obj].x));
					path.lineTo(obstacles[obj].x + dx, obstacles[obj].y - dy);
					path.lineTo(obstacles[obj].x - dx, obstacles[obj].y + dy);
					path.lineTo(canvas.width, this.y + (this.y - obstacles[obj].y - dy) * (canvas.width - this.x) / (this.x - obstacles[obj].x));
					path.lineTo(canvas.width, 0);
					path.closePath();
					ctx.clip(path);
				}
			} else if (this.y > obstacles[obj].y) {
				// Project onto y = 0, dx positive
				var path = new Path2D();
				path.lineTo(0,0);
				path.lineTo(this.x - (this.x - obstacles[obj].x + dx) * this.y / (this.y - obstacles[obj].y - dy), 0);
				path.lineTo(obstacles[obj].x - dx, obstacles[obj].y + dy);
				path.lineTo(obstacles[obj].x + dx, obstacles[obj].y - dy);
				path.lineTo(this.x - (this.x - obstacles[obj].x - dx) * this.y / (this.y - obstacles[obj].y + dy), 0);
				path.lineTo(canvas.width, 0);
				path.lineTo(canvas.width, canvas.height);
				path.lineTo(0, canvas.height);
				path.closePath();
				ctx.clip(path);
			} else {
				// Project onto y = canvas.height, dx negative
				var path = new Path2D();
				path.lineTo(0,0);
				path.lineTo(0, canvas.height);
				path.lineTo(this.x + (this.x - obstacles[obj].x - dx) * (canvas.height - this.y) / (this.y - obstacles[obj].y + dy), canvas.height);
				path.lineTo(obstacles[obj].x + dx, obstacles[obj].y - dy);
				path.lineTo(obstacles[obj].x - dx, obstacles[obj].y + dy);
				path.lineTo(this.x + (this.x - obstacles[obj].x + dx) * (canvas.height - this.y) / (this.y - obstacles[obj].y - dy), canvas.height);
				path.lineTo(canvas.width, canvas.height);
				path.lineTo(canvas.width, 0);
				path.closePath();
				ctx.clip(path);
			}
		}
		ctx.globalAlpha = this.intensity;
		ctx.drawImage(bulbCanvas, this.x - canvas.width, this.y - canvas.height);
		ctx.globalAlpha = 1;
		ctx.restore();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
		ctx.strokeStyle = "#000000";
		ctx.stroke();
	};
}

