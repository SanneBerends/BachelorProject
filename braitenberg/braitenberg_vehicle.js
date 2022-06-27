/*  Braitenberg vehicles
 *  Vehicle script
 *  Copyright 2021 Harmen de Weerd
 */

function BraitenbergSensor(position, effect = effectorType.LEFTMOTOR, strength = 1, type = sensorType.LIGHT) {
	this.position = position;
	this.effect = effect;
	this.type = type;
	this.strength = strength;
	this.draw = function(ctx, distance) {
		ctx.save();
		ctx.rotate(this.position);
		if (this.type == sensorType.DISTANCE) {
			ctx.beginPath();
			ctx.moveTo(distance, 0);
			ctx.lineTo(distance + braitenbergConstants.vehicle.detectionRange, 0);
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "rgba(255,0,0,0.8)";
			ctx.stroke();
			ctx.beginPath();
			ctx.rect(distance*0.9, -distance*0.1, distance*0.2, distance*0.2);
			ctx.strokeStyle = "#000000";
			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.arc(distance, 0, distance*0.1, 0, 2*Math.PI);
			ctx.strokeStyle = "#000000";
			ctx.stroke();
		}
		ctx.fillStyle = sensorColors[this.effect];
		ctx.fill();
		ctx.restore();
	};
}

function BraitenbergVehicle(environment = null, baseEffectorIntensity = [], sensors = []) {
	this.environment = environment;
	this.sensors = sensors;
	this.x = 0;
	this.y = 0;
	this.id = -1;
	this.color = braitenbergConstants.vehicle.defaultColor;
	this.angle = 0;
	this.bulbIntensity = 0;
	this.baseEffectorIntensity = baseEffectorIntensity;
	this.getRadius = function() {
		return this.environment.vehicleSize;
	};
	this.getWidth = function() {
		return this.environment.vehicleSize*2;
	};
	this.getHeight = function() {
		return this.environment.vehicleSize*2;
	};
	this.aggregateSensorData = function() {
		var effect = {};
		for (var effector in effectorType) {
			effect[effectorType[effector]] = this.baseEffectorIntensity[effectorType[effector]];
		}
		for (var sensor in this.sensors) {
			var sensorData = 0;
			var xSensor = this.x + this.environment.vehicleSize * Math.cos(this.angle + this.sensors[sensor].position);
			var ySensor = this.y + this.environment.vehicleSize * Math.sin(this.angle + this.sensors[sensor].position);
			switch (this.sensors[sensor].type) {
				case sensorType.LIGHT:
					sensorData = this.environment.getLightIntensity({x: xSensor, y: ySensor, id: this.id});
					break;
			}
			effect[this.sensors[sensor].effect] += this.sensors[sensor].strength * sensorData;
		}
		return effect;
	}
	this.move = function() {
		if (this.elem !== undefined && this.elem.currentAction == GraphicsConstants.ACTION_DRAG) {

			return;
		}
		var effect = this.aggregateSensorData();
		var speedL = effect[effectorType.LEFTMOTOR];
		var speedR = effect[effectorType.RIGHTMOTOR];
		var totalSpeed = Math.sqrt(Math.pow(speedL, 2) + Math.pow(speedR, 2));
		if (totalSpeed > this.environment.maxSpeed) {
			speedL *= this.environment.maxSpeed / totalSpeed;
			speedR *= this.environment.maxSpeed / totalSpeed;
		}
		var newPos = {x: 0, y: 0};
		if (Math.abs(speedR - speedL) < 0.0001) { // straight ahead
			newPos.x = this.x + speedR * Math.cos(this.angle);
			newPos.y = this.y + speedR * Math.sin(this.angle);;
		} else {
			// Vehicle moves along virtual circle caused by left wheel advancing speedL
			// and right wheel advancing speedR, while distance between them remains vehicleSize
			var radius = this.environment.vehicleSize * (speedL + speedR) / (speedL - speedR);
			var deltaAngle = (speedL - speedR) / (2 * this.environment.vehicleSize);
			
			newPos.x = this.x + radius * (Math.cos(this.angle - Math.PI/2 + deltaAngle) - Math.cos(this.angle - Math.PI/2));
			newPos.y = this.y + radius * (Math.sin(this.angle - Math.PI/2 + deltaAngle) - Math.sin(this.angle - Math.PI/2));
			this.angle += deltaAngle;
		}
		if (newPos.x > this.environment.canvas.width - 5 || newPos.x < 5 || newPos.y > this.environment.canvas.height - 5 || newPos.y < 5) { //reached edge table top
			//remove vehicle, replace by random surviving vehicle: alteration
			newPos = this.environment.replaceVehicle(this);
		}
		this.environment.attemptMove(this.id, newPos, this);
		this.x = newPos.x;
		this.y = newPos.y;

	};
	this.draw = function(ctx, x = 0, y = 0) {
		var size = this.environment.vehicleSize;
		ctx.save();
		ctx.translate(this.x + x, this.y + y);
		ctx.rotate(this.angle);
		// Wheels
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = sensorColors[effectorType.RIGHTMOTOR];
		ctx.strokeRect(-2 * size / 3, 1.1 * size, size * 4 / 3, -size / 2);
		ctx.fillRect(-2 * size / 3, 1.1 * size, size * 4 / 3, -size / 2);
		ctx.fillStyle = sensorColors[effectorType.LEFTMOTOR];
		ctx.strokeRect(-2 * size / 3, -1.1 * size, size * 4 / 3, size / 2);
		ctx.fillRect(-2 * size / 3, -1.1 * size, size * 4 / 3, size / 2);
		// Base
		ctx.beginPath();
		ctx.arc(0, 0, size, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = this.color //braitenbergConstants.vehicle.baseColor;
		ctx.fill();
		// Head
		ctx.beginPath();
		ctx.arc(0, 0, size*0.4, -Math.PI/4, Math.PI/4);
		ctx.arc(0, 0, size*0.8, Math.PI/4, -Math.PI/4, true);
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = this.color;
		ctx.fill();
		// Light
		ctx.beginPath();
		ctx.arc(0, 0, size/5, 0, 2*Math.PI);
		ctx.stroke();
		var intensity = Math.floor(this.bulbIntensity * 256);
		ctx.fillStyle = "rgb(" + intensity + "," + intensity + "," + intensity + ")";
		ctx.fill();
		for (var sensor in this.sensors) {
			this.sensors[sensor].draw(ctx, size);
		}
		ctx.restore();
	};
}



