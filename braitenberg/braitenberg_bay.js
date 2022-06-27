/*  Braitenberg vehicles
 *  Bay control script
 *  Copyright 2021 Harmen de Weerd
 */

function BraitenbergBay(canvas) {
	this.canvas = canvas;
	this.vehicleSize = braitenbergConstants.bay.vehicleSize;
	this.maxSensors = braitenbergConstants.bay.maxSensors;
	this.agent = new BraitenbergVehicle(this);
	this.agent.x = this.canvas.width/2;
	this.agent.y = this.canvas.height/2;
	this.agent.angle = -Math.PI/2;
	this.repaint = function() {
		var ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.agent.draw(ctx);
		if (this.selectedSensor != null) {
			ctx.save();
			ctx.translate(this.canvas.width/2, this.canvas.height/2);
			ctx.rotate(this.selectedSensor.position);
			ctx.beginPath();
			ctx.moveTo(-this.vehicleSize/10, -1.35*this.vehicleSize);
			ctx.lineTo(this.vehicleSize/10, -1.35*this.vehicleSize);
			ctx.lineTo(0, -1.15*this.vehicleSize);
			ctx.closePath();
			ctx.fillStyle = braitenbergConstants.bay.sensorArrowColor;
			ctx.fill();
			ctx.restore();
		}
	};
	this.load = function(agent) {
		this.agent.id = agent.id;
		this.agent.color = agent.color;
		this.agent.sensors = agent.sensors;
		this.agent.baseEffectorIntensity = agent.baseEffectorIntensity;
		for (var i = 0; i < this.agent.sensors.length; ++i) {
			this.resetInteractiveElementPosition(i);
		}
		setSensorNumber(this.agent.sensors.length);
		loadSensor(null, null);
		setLightBulbValue(this.agent.baseEffectorIntensity[effectorType.BULB]*100);
		setLeftMotorValue(this.agent.baseEffectorIntensity[effectorType.LEFTMOTOR]*10);
		setRightMotorValue(this.agent.baseEffectorIntensity[effectorType.RIGHTMOTOR]*10);
		this.repaint();
	};
	this.resetInteractiveElementPosition = function(id) {
		if (id < this.agent.sensors.length) {
			this.elems[id].x = Math.cos(this.agent.sensors[id].position + this.agent.angle)*this.vehicleSize + this.canvas.width/2 - this.vehicleSize/10;
			this.elems[id].y = Math.sin(this.agent.sensors[id].position + this.agent.angle)*this.vehicleSize + this.canvas.height/2 - this.vehicleSize/10;
		} else {
			this.elems[id].x = -100;
		}
	};
	this.elems = [];
	var sensorInfo = {
		getWidth: function() {
			return braitenbergConstants.bay.vehicleSize/5;
		},
		getHeight: function() {
			return braitenbergConstants.bay.vehicleSize/5;
		}
	};
	for (var i = 0; i < this.maxSensors; ++i) {
		this.elems[i] = new InteractiveElement(this.canvas, sensorInfo, -100, -100);
		this.elems[i].id = i;
		this.elems[i].onDragging = dragSensor;
		this.elems[i].onDrag = loadSensor;
	}
}

function dragSensor(elem, event) {
	var angle = Math.acos((bay.canvas.height/2 - event.mouse.y) / Math.sqrt(Math.pow(event.mouse.x - bay.canvas.width/2,2) + Math.pow(event.mouse.y - bay.canvas.height/2,2)));
	bay.agent.sensors[elem.id].position = angle;
	if (event.mouse.x < bay.canvas.width/2) {
		bay.agent.sensors[elem.id].position *= -1;
	}
	bay.resetInteractiveElementPosition(elem.id);
	requestRepaint();
}

function loadSensor(elem, event) {
	if (elem != null && elem.id >= 0) {
		loadSensorInfo(bay.agent.sensors[elem.id]);
		document.getElementById("sensorEffectSelect").disabled = false;
		document.getElementById("sensorTypeSelect").disabled = false;
		document.getElementById("sensorStrengthDial").disabled = false;
	} else {
		bay.selectedSensor = null;
		document.getElementById("sensorEffectSelect").disabled = true;
		document.getElementById("sensorTypeSelect").disabled = true;
		document.getElementById("sensorStrengthDial").disabled = true;
	}
	bay.repaint();
	return true;
}

function loadSensorInfo(sensor) {
	bay.selectedSensor = sensor;
	document.getElementById("sensorEffectSelect").selectedIndex = sensor.effect;
	document.getElementById("sensorTypeSelect").selectedIndex = sensor.type;
	document.getElementById("sensorStrengthDial").value = sensor.strength * 10;
	document.getElementById("sensorStrengthLabel").innerHTML = sensor.strength;
	return true;
}

function setSensorStrength(newValue) {
	bay.selectedSensor.strength = newValue / 10;
	document.getElementById("sensorStrengthLabel").innerHTML = bay.selectedSensor.strength;
	document.getElementById("sensorStrengthDial").value = bay.selectedSensor.strength*10;
}

function changeMotor(value) {
	bay.selectedSensor.effect = value*1;
	document.getElementById("sensorEffectSelect").selectedIndex = bay.selectedSensor.effect;
	requestRepaint();
}

function changeType(value) {
	bay.selectedSensor.type = value*1;
	document.getElementById("sensorTypeSelect").selectedIndex = bay.selectedSensor.type;
	requestRepaint();
}

function setSensorNumber(newValue) {
	loadSensor(null, null);
	while (bay.agent.sensors.length > newValue*1) {
		bay.agent.sensors[bay.agent.sensors.length - 1] = null;
		bay.agent.sensors.length = bay.agent.sensors.length - 1;
	}
	while (bay.agent.sensors.length < newValue*1) {
		bay.agent.sensors.push(new BraitenbergSensor(Math.random()*Math.PI*2));
	}
	for (var i = 0; i < bay.elems.length; ++i) {
		bay.resetInteractiveElementPosition(i);
	}
	document.getElementById("sensorLabel").innerHTML = newValue;
	document.getElementById("sensorDial").value  = newValue;
	requestRepaint();
}

