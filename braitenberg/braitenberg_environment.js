/*  Braitenberg vehicles
 *  Environment script
 *  Copyright 2021 Harmen de Weerd
 */

function BraitenbergEnvironment(arena) {
	this.canvas = arena;
	this.running = false;
	this.vehicleSize = braitenbergConstants.vehicle.size;
	this.bulbSize = braitenbergConstants.bulbSize;
	this.maxSpeed = braitenbergConstants.vehicle.maxSpeed;
	this.vehicles = [];
	this.bulbs = []
	this.animationHandle = 0;
	this.numberOfBulbs = 4 ;
	this.indexBulb1 = 0;
	this.numberOfVehicles = 10;
	this.epoch = 0;
	this.vehicleHistory = [];
	this.numVeh = Array(10).fill(1);
	this.tick = 0;
	this.allTicks = 0;
	this.afterEquilibrium = false;
	this.totalSplash = 0;
	this.totalExperiments = experiment.totalExperiments;


	this.getTotalExperiments = function() {
		return this.totalExperiments;
	}
	this.addBulb = function(x, y) {
		var bulb = new BraitenbergBulb(x, y, this.bulbSize);
		this.bulbs.push(bulb);
		bulb.elem = new InteractiveElement(this.canvas, bulb, -this.bulbSize, -this.bulbSize, GraphicsConstants.MODE_RELATIVE);
		bulb.elem.onDragging = requestRepaint;
	};
	this.addVehicle = function(vehicle) {
		vehicle.id = this.vehicles.length;
		this.vehicles.push(vehicle);
		vehicle.environment = this;
		vehicle.elem = new InteractiveElement(this.canvas, vehicle, -this.vehicleSize, -this.vehicleSize, GraphicsConstants.MODE_RELATIVE);
		vehicle.elem.onDragging = requestRepaint;
	};
	//start of a new epoch
	this.startNewEpoch = function() {
		this.vehicleHistory = [];

		this.numVeh = Array(10).fill(1);
		for (var i = this.epoch; i >= 1; i--) {
			document.getElementById('evo').deleteRow(i);
		}
		this.epoch = 0;
		document.getElementById("col0").innerHTML = "";
		document.getElementById("col1").innerHTML = "";
		document.getElementById("col2").innerHTML = "";
		document.getElementById("col3").innerHTML = "";

		init();
	};
	//function taken from https://stackoverflow.com/a/41682189
	function sumArray(a, b) {
		var c = [];
		for (var i = 0; i < Math.max(a.length, b.length); i++) {
			c.push((a[i] || 0) + (b[i] || 0));
		}
		return c;
	}
	// function to replace Vehicle from the arena
	this.replaceVehicle = function(oldVehicle) {
		this.totalSplash += 1;
		this.tick = 0;
		experiment.dataGraphOne[this.epoch] = sumArray(experiment.dataGraphOne[this.epoch],this.numVeh.slice()) ;

		this.epoch += 1;
		this.updateOverview(oldVehicle);

		if (Math.max(...this.numVeh) > 9) {
			experiment.dataGraphTwo[this.numVeh.indexOf(10)] += 1;
			experiment.dataGraphThree[1] += 1;
			for (var i = this.epoch ; i<60; i ++) {
				experiment.dataGraphOne[i] = sumArray(experiment.dataGraphOne[i],this.numVeh.slice()) ;
			}
			experiment.totalTicks += this.allTicks;
			experiment.totalTicksSquared += Math.pow(this.allTicks, 2);
			this.allTicks = 0;
			experiment.totalEpochs += this.epoch;
			experiment.totalEpochsSquared += Math.pow(this.epoch, 2);
			toggleSimulation(true);
			return {x:oldVehicle.x, y:oldVehicle.y};
		}

		this.numVeh[this.determineBreed(oldVehicle)] -= 1;

		// choose which vehicle to 'copy'
		this.replacerId = Math.floor(Math.random() * 10);
		while (this.replacerId == oldVehicle.id) {
			this.replacerId = Math.floor(Math.random() * 10);
		}
		this.parentVehicle = this.vehicles[this.replacerId];

		// replace the workings of old vehicle by the parent vehicle
		for (var i = 0; i < this.parentVehicle.sensors.length; i++ ) {
			oldVehicle.sensors[i].effect = this.parentVehicle.sensors[i].effect;
			oldVehicle.sensors[i].strength =  this.parentVehicle.sensors[i].strength;
		}

		// change the sensors a bit based on random multiplication factor between 0.9 and 1.1
		this.randomMultiplier = Math.random() * (1.1 - 0.9) + 0.9;

		oldVehicle.sensors[0].strength *= this.randomMultiplier;
		oldVehicle.sensors[1].strength *= this.randomMultiplier;
		oldVehicle.baseEffectorIntensity = this.parentVehicle.baseEffectorIntensity;
		oldVehicle.angle = Math.random()*Math.PI*2;
		if (experiment.phase == 2 || (experiment.phase == 3 && this.afterEquilibrium)) {
			oldVehicle.bulbIntensity = 5;
		}

		//find random new location: 30 inwards from edges
		var pos = {x:0, y:0};

		do {
			pos.x = Math.floor(Math.random() * 625);
			pos.y = Math.floor(Math.random() * 500);
			if (pos.x <= 30) {
				pos.x = 30;
			}
			if (pos.x >= 595) {
				pos.x = 595;
			}
			if (pos.y <= 30) {
				pos.y = 30;
			}
			if (pos.y >= 470) {
				pos.y = 470;
			}
		} while (!checkIfValid(oldVehicle, pos));

		oldVehicle.color = this.parentVehicle.color;

		//keep track of which vehicles are in environment for overview
		this.numVeh[this.determineBreed(oldVehicle)] += 1;
		if (this.epoch == 59) {
			this.stopExperiment();
		}
		return pos;
	};
	//find the 'index' of the vehicle type
	this.determineBreed = function (vehicle) {
		var breed = 0;
		switch (vehicle.color) {
			case 'red':
				breed = 0;
				break;
			case 'blue':
				breed = 1;
				break;
			case 'green':
				breed = 2;
				break;
			case 'white':
				breed = 3;
				break;
			case 'pink':
				breed = 4;
				break;
			case 'yellow':
				breed = 5;
				break;
			case 'cyan':
				breed = 6;
				break;
			case 'magenta':
				breed = 7;
				break;
			case 'aquamarine':
				breed = 8;
				break;
			case 'brown':
				breed = 9;
				break;
		}
		return breed;
	};
	//update the vehicle data
	this.updateOverview = function (oldVehicle){
		this.vehicleData = {col : oldVehicle.color, strengthL: oldVehicle.sensors[0].strength, strengthR: oldVehicle.sensors[1].strength, lifespan: this.epoch};
		this.vehicleHistory.push(this.vehicleData);

		//show vehicle history in html
		var row = document.getElementById("evo").insertRow(this.epoch);
		for(var i = 0; i <= 4; i++){
			var cell = 'cell' + i;
			cell = row.insertCell(i);

			switch (i) {
				case 0:
					var cellCopy = document.getElementById('col0').innerHTML;
					cell.innerHTML = cellCopy;
					document.getElementById("col0").innerHTML = this.vehicleData.col
					break;
				case 1:
					var cellCopy = document.getElementById('col1').innerHTML;
					cell.innerHTML = cellCopy;
					document.getElementById("col1").innerHTML = this.vehicleData.strengthL
					break;
				case 2:
					var cellCopy = document.getElementById('col2').innerHTML;
					cell.innerHTML = cellCopy;
					document.getElementById("col2").innerHTML = this.vehicleData.strengthR
					break;
				case 3:
					var cellCopy = document.getElementById('col3').innerHTML;
					cell.innerHTML = cellCopy;
					document.getElementById("col3").innerHTML = this.vehicleData.lifespan
			}
		}
	};
	this.draw = function() {
		var ctx = this.canvas.getContext("2d");
		ctx.fillStyle = braitenbergConstants.baseArenaColor;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.save();
		for (var b = this.indexBulb1; b < (this.numberOfBulbs + this.indexBulb1); ++b) {
			this.bulbs[b].draw(this.canvas, this.vehicles.slice(0,this.numberOfVehicles));
		}
		var vehicleBulb = new BraitenbergBulb(0, 0, this.bulbSize);
		for (var i = 0; i < this.numberOfVehicles; ++i) {
			vehicleBulb.x = this.vehicles[i].x;
			vehicleBulb.y = this.vehicles[i].y;
			vehicleBulb.id = this.vehicles[i].id;
			vehicleBulb.intensity = this.vehicles[i].bulbIntensity;
			vehicleBulb.draw(this.canvas, this.vehicles.slice(0,this.numberOfVehicles));
		}
		ctx.restore();
		for (var i = 0; i < this.numberOfVehicles; ++i) {
			this.vehicles[i].draw(ctx);
		}
	};
	this.stopExperiment = function() {
		var cnt = 0;
		for (var i =0; i < 10; i++) {
			if (this.numVeh[i] != 0) {
				cnt += 1;
			}
		}
		experiment.dataGraphThree[cnt] += 1;

		var dominant = Math.max(...this.numVeh);
		for (var i = 0; i < 10; i++) {
			if (this.numVeh[i] == dominant ) {
				experiment.dataGraphTwo[i] += 1;
			}
		}

		for (var i = this.epoch ; i<60; i ++) {
			experiment.dataGraphOne[i] = sumArray(experiment.dataGraphOne[i],this.numVeh.slice()) ;
		}
		experiment.totalTicks += this.allTicks;
		experiment.totalTicksSquared += Math.pow(this.allTicks, 2);
		this.allTicks = 0;
		experiment.totalEpochs += this.epoch;
		experiment.totalEpochsSquared += Math.pow(this.epoch, 2);
		toggleSimulation(true);
	};
	this.step = function() {
		this.tick += 1;
		this.allTicks += 1;

		if (this.tick > 10000 && !(experiment.phase == 3 && !this.afterEquilibrium)) {
			this.stopExperiment();
		} else if (this.tick > 10000 && experiment.phase == 3 && !this.afterEquilibrium) {
			this.tick = 0;
			this.afterEquilibrium = true;
			for (var i = 0; i < this.numberOfVehicles; ++i) {
				this.vehicles[i].bulbIntensity = 5;
			}
		}
		for (var i = 0; i < this.numberOfVehicles; ++i) {
			this.vehicles[i].move();
		}
		requestRepaint();
		if (this.running) {
			setTimeout("env.step()", braitenbergConstants.stepDelay);
		}
	};
	this.getSensingDistance = function(sensor, sensingMax) {
		var dist = getDistance(sensor, sensingMax);
		for (var v = 0; v < this.numberOfVehicles; ++v) {
			if (isBlocked(sensor, sensingMax, this.vehicles[v], this.vehicleSize)) {
				dist = Math.min(dist, getDistance(sensor, this.vehicles[v]));
			}
		}
		return dist;
	};
	this.getLightIntensity = function(pos) {
		var darkness = 1;
		for (var b = this.indexBulb1; b < (this.numberOfBulbs + this.indexBulb1); ++b) {
			var blocked = false;
			for (var v = 0; v < this.numberOfVehicles; ++v) {
				blocked = blocked || isBlocked(pos, this.bulbs[b], this.vehicles[v], this.vehicleSize);
			}
			if (!blocked) {
				darkness *= (1 - this.bulbs[b].intensity * bulbIntensity(pos.x - this.bulbs[b].x,Math.abs(pos.y - this.bulbs[b].y)));
			}
		}
		for (var b = 0; b < this.numberOfVehicles; ++b) {
			var blocked = b == pos.id;
			for (var v = 0; v < this.numberOfVehicles; ++v) {
				if (b != v) {
					blocked = blocked || isBlocked(pos, this.vehicles[b], this.vehicles[v], this.vehicleSize);
				}
			}
			if (!blocked) {
				darkness *= (1 - this.vehicles[b].bulbIntensity * bulbIntensity(pos.x - this.vehicles[b].x,Math.abs(pos.y - this.vehicles[b].y)));
			}
		}
		return 1 - darkness;
	};
	this.attemptMove = function(id, position, originalPosition) {
		position.x = Math.max(this.vehicleSize, Math.min(this.canvas.width - this.vehicleSize, position.x));
		position.y = Math.max(this.vehicleSize, Math.min(this.canvas.height - this.vehicleSize, position.y));
		for (var i = 0; i < this.numberOfVehicles; ++i) {
			if (this.vehicles[i].id != id) {
				var dist = getDistance(this.vehicles[i], position);
				if (dist < this.vehicleSize*2) {
					var originalDist = getDistance(this.vehicles[i], originalPosition);


					position.x = originalPosition.x + (position.x - originalPosition.x) * (originalDist - this.vehicleSize*2) / (originalDist - dist);
					position.y = originalPosition.y + (position.y - originalPosition.y) * (originalDist - this.vehicleSize*2) / (originalDist - dist);
				}
				if (isNaN(position.x) || isNaN(position.y)) {
					position.x = originalPosition.x;
					position.y = originalPosition.y;
				}
			}
		}
	};
}

function requestRepaint() {
	if (env.animationHandle == 0) {
		env.animationHandle = window.requestAnimationFrame(repaint);
	}
}

function repaint() {
	env.animationHandle = 0;
	env.draw();
	bay.repaint();
}

function isBlocked(viewerPoint, viewedPoint, potentialBlocker, blockerSize) {

	var distViewedSq = Math.pow(viewedPoint.x - viewerPoint.x, 2) + Math.pow(viewedPoint.y - viewerPoint.y, 2);
	var distBlockerSq = Math.pow(potentialBlocker.x - viewerPoint.x, 2) + Math.pow(potentialBlocker.y - viewerPoint.y, 2);
	// The cosine of the angle between the viewing directions is inner product divided by product of the vector lengths
	if (distBlockerSq - 100 < distViewedSq ) {
		var innerProduct = (potentialBlocker.x - viewerPoint.x)*(viewedPoint.x - viewerPoint.x) + (potentialBlocker.y - viewerPoint.y)*(viewedPoint.y - viewerPoint.y);
		if (innerProduct > 0) {
			// The front end of the blocker is closer than the center of the bulb,
			// and the viewing angle between the two is acute (cosine is positive).
			// We now need to determine the distance of the blocker to line connecting viewer to viewed
			var distSq = distBlockerSq - Math.pow(innerProduct,2) / distViewedSq;
			if (distSq < blockerSize*blockerSize) {
				return true;
			}
		}
	}
	return false;
}

function getDistance(pos1, pos2) {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}