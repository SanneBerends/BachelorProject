/*  Braitenberg vehicles
 *  GUI script
 *  Copyright 2021 Harmen de Weerd
 */


function init() {
	if (experiment.experimentType == 0 && (( experiment.phase == 0 && experiment.totalExperiments == 2) || (experiment.phase != 3 && experiment.totalExperiments == 17))) { //Qualitative 1 done
		//new phase
		experiment.totalExperiments = -1;
		experiment.phase += 1;
	} else if (experiment.experimentType == 0 && experiment.phase == 3 && experiment.totalExperiments == 17) {
		//qualitative analysis is done
		return;
	}
	if (experiment.experimentType == 1 && (experiment.totalExperiments + 1) % 60 == 0 && experiment.totalExperiments>1) {
		//create csv file
		for(var i = 0; i < 60; i++){
			for(var j = 0; j < 10; j++){
				experiment.dataGraphOne[i][j] /= 60;
			}
		}

		var content1, content2, content3,content4, content5, content6, content7, blobGraphs, a;
		content1 = experiment.dataGraphOne.join('\n');
		content2 = experiment.dataGraphTwo;
		content3 = experiment.dataGraphThree;
		content4 = experiment.totalTicks;
		content5 = experiment.totalTicksSquared;
		content6 = experiment.totalEpochs;
		content7 = experiment.totalEpochsSquared;

		for(var i = 0; i < 10; i++){
			content2[i] /= 60;
			content3[i] /= 60;
		}

		content2.join(',');
		content3.join(',');

		var totalContent = [content1, content2, content3, content4, content5, content6, content7].join('\n\n');
		blobGraphs = new Blob([totalContent], {type: "text/csv"});
		a = document.createElement("a");
		a.download = "graphs.csv";
		a.href = window.URL.createObjectURL(blobGraphs);
		a.textContent = "DownloadGraphs";
		a.dataset.downloadurl = ["text/csv", a.download, a.href].join(":");
		document.body.appendChild(a);

		experiment.dataGraphOne = Array(60).fill().map(() => Array(1).fill(0));
		experiment.dataGraphTwo = Array(10).fill(0);
		experiment.dataGraphThree = Array(11).fill(0);
		experiment.totalTicks = 0;
		experiment.totalTicksSquared = 0;
		experiment.totalEpochs = 0;
		experiment.totalEpochsSquared = 0;
	}

	if (experiment.experimentType == 1 && (( experiment.phase == 0 && experiment.totalExperiments == 59) || (experiment.phase != 3 && experiment.totalExperiments == 959))) { //Quantitative 1 done
		//new phase
		experiment.totalExperiments = -1;
		experiment.phase += 1;
	} else if (experiment.experimentType == 1 && experiment.phase == 3 && experiment.totalExperiments == 959) {

		//quantitative analysis is done
		return;
	}
	experiment.totalExperiments += 1;
	addMouseTracker(document.getElementById("arenaBraitenberg"));
	env = new BraitenbergEnvironment(document.getElementById("arenaBraitenberg"));
	addMouseTracker(document.getElementById("bayBraitenberg"));
	bay = new BraitenbergBay(document.getElementById("bayBraitenberg"));

	for (var v = 0; v < braitenbergInfo.vehicles.length; ++v) {
		var vehicle = new BraitenbergVehicle();
		loadAgentData(braitenbergInfo.vehicles[v], vehicle, v);
		vehicle.color = braitenbergInfo.vehicles[v].color;
		vehicle.angle = Math.random()*Math.PI*2;
		if (experiment.phase == 1) {
			vehicle.bulbIntensity = 5;
		}
		env.addVehicle(vehicle);
		vehicle.elem.onDrag = function(agentElem, evt){
			bay.load(agentElem.elem);
			return true;
		};
	}
	for (var b = 0; b < braitenbergInfo.bulbs.length; ++b) {
		env.addBulb(braitenbergInfo.bulbs[b].x, braitenbergInfo.bulbs[b].y);
	}
	initBraitenbergBulbCanvas(env.canvas.width, env.canvas.height);
	bay.load(env.vehicles[0]);

	if ((experiment.experimentType == 1 && !(experiment.totalExperiments % 60 == 0)) && ! (experiment.experimentType == 1 && experiment.phase == 3 && experiment.totalExperiments == 960)) {
		toggleSimulation(true);
	} else {
		toggleSimulation(false);
	}
	var bulbInfo = getBulbs();
	var numBulbs = bulbInfo[0];
	var i = bulbInfo[1];
	var j = bulbInfo[2];
	setBulbNumber(numBulbs, i, j);
	setVehicleNumber(10);
	requestRepaint();
}

function getBulbs() { // returns: amount of bulbs, i, j for finding those bulbs in the list
	//qualitative
	if (experiment.experimentType == 0) {

		//agents have no lights
		if (experiment.phase == 0 ){
			return [1, 4, 5];
		}

		//condition a
		if (env.getTotalExperiments() >= 0 && env.getTotalExperiments() < 3) {
			return [0, 0, 0];
		}

		//condition b
		if (env.getTotalExperiments() >= 3 && env.getTotalExperiments() < 4) {
			return [1, 0, 1];
		}
		if (env.getTotalExperiments() >= 4 && env.getTotalExperiments() < 5) {
			return [1, 1, 2];
		}
		if (env.getTotalExperiments() >= 5 && env.getTotalExperiments() < 6) {
			return [1, 2, 3];
		}
		if (env.getTotalExperiments() >= 6 && env.getTotalExperiments() < 7) {
			return [1, 3, 4];
		}
		if (env.getTotalExperiments() >= 7 && env.getTotalExperiments() < 8) {
			return [1, 4, 5];
		}

		//condition c
		if (env.getTotalExperiments() >= 8 && env.getTotalExperiments() < 9) {
			return [2, 0, 2];
		}
		if (env.getTotalExperiments() >= 9 && env.getTotalExperiments() < 10) {
			return [2, 1, 3];
		}
		if (env.getTotalExperiments() >= 10 && env.getTotalExperiments() < 11) {
			return [2, 5, 7];
		}

		//condition d
		if (env.getTotalExperiments() >= 11 && env.getTotalExperiments() < 12) {
			return [3, 0, 3];
		}
		if (env.getTotalExperiments() >= 12 && env.getTotalExperiments() < 13) {
			return [3, 6, 9];
		}
		if (env.getTotalExperiments() >= 13 && env.getTotalExperiments() < 14) {
			return [3, 1, 4];
		}
		if (env.getTotalExperiments() >= 14 && env.getTotalExperiments() < 15) {
			return [3, 5, 8];
		}

		//condition e
		if (env.getTotalExperiments() >= 15 && env.getTotalExperiments() < 16) {
			return [4, 9, 13];
		}
		if (env.getTotalExperiments() >= 16 && env.getTotalExperiments() < 17) {
			return [4, 13, 17];
		}
		if (env.getTotalExperiments() >= 17 && env.getTotalExperiments() < 18) {
			return [4, 17, 21];
		}

	}

	//quantitative
	if (experiment.experimentType == 1) {

		//agents have no lights
		if (experiment.phase == 0 ){
			return [1, 4, 5];
		}

		//condition a
		if (env.getTotalExperiments() >= 0 && env.getTotalExperiments() < 60) {
			return [0, 0, 0];
		}

		//condition b
		if (env.getTotalExperiments() >= 60 && env.getTotalExperiments() < 120) {
			return [1, 0, 1];
		}
		if (env.getTotalExperiments() >= 120 && env.getTotalExperiments() < 180) {
			return [1, 1, 2];
		}
		if (env.getTotalExperiments() >= 180 && env.getTotalExperiments() < 240) {
			return [1, 2, 3];
		}
		if (env.getTotalExperiments() >= 240 && env.getTotalExperiments() < 300) {
			return [1, 3, 4];
		}
		if (env.getTotalExperiments() >= 300 && env.getTotalExperiments() < 360) {
			return [1, 4, 5];
		}

		//condition c
		if (env.getTotalExperiments() >= 360 && env.getTotalExperiments() < 420) {
			return [2, 0, 2];
		}
		if (env.getTotalExperiments() >= 420 && env.getTotalExperiments() < 480) {
			return [2, 1, 3];
		}
		if (env.getTotalExperiments() >= 480 && env.getTotalExperiments() < 540) {
			return [2, 5, 7];
		}

		//condition d
		if (env.getTotalExperiments() >= 540 && env.getTotalExperiments() < 600) {
			return [3, 0, 3];
		}
		if (env.getTotalExperiments() >= 600 && env.getTotalExperiments() < 660) {
			return [3, 6, 9];
		}
		if (env.getTotalExperiments() >= 660 && env.getTotalExperiments() < 720) {
			return [3, 1, 4];
		}
		if (env.getTotalExperiments() >= 720 && env.getTotalExperiments() < 780) {
			return [3, 5, 8];
		}

		//condition e
		if (env.getTotalExperiments() >= 780 && env.getTotalExperiments() < 840) {
			return [4, 9, 13];
		}
		if (env.getTotalExperiments() >= 840 && env.getTotalExperiments() < 900) {
			return [4, 13, 17];
		}
		if (env.getTotalExperiments() >= 900 && env.getTotalExperiments() < 960) {
			return [4, 17, 21];
		}
	}
}


function setBulbNumber(newValue, i ,j) {
	env.numberOfBulbs = newValue*1;
	env.indexBulb1 = i;
	for (var b = 0; b < braitenbergInfo.bulbs.length; ++b) {
		env.bulbs[b].elem.active = true;
	}

	for (var b = 0; b < i; ++b) {
		env.bulbs[b].elem.active = false;
	}
	for (var b = j; b < braitenbergInfo.bulbs.length; ++b) {
		env.bulbs[b].elem.active = false;
	}

	document.getElementById("bulbLabel").innerHTML = newValue;
	document.getElementById("bulbDial").value = newValue;
	requestRepaint();
}

function setVehicleNumber(newValue) {
	env.numberOfVehicles = newValue*1;
	for (var v = 0; v < env.numberOfVehicles; ++v) {
		env.vehicles[v].elem.active = true;
		
	}
	for (var v = env.numberOfVehicles; v < env.vehicles.length; ++v) {
		env.vehicles[v].elem.active = false;
		
	}
	requestRepaint();
}

function setLightBulbValue(newValue) {
	bay.agent.baseEffectorIntensity[effectorType.BULB] = newValue/100;
	document.getElementById("lightBulbLabel").innerHTML = bay.agent.baseEffectorIntensity[effectorType.BULB];
	document.getElementById("lightBulbDial").value = bay.agent.baseEffectorIntensity[effectorType.BULB]*100;
}

function setLeftMotorValue(newValue) {
	bay.agent.baseEffectorIntensity[effectorType.LEFTMOTOR] = newValue/10;
	document.getElementById("leftMotorLabel").innerHTML = bay.agent.baseEffectorIntensity[effectorType.LEFTMOTOR];
	document.getElementById("leftMotorDial").value = bay.agent.baseEffectorIntensity[effectorType.LEFTMOTOR]*10;
}

function setRightMotorValue(newValue) {
	bay.agent.baseEffectorIntensity[effectorType.RIGHTMOTOR] = newValue/10;
	document.getElementById("rightMotorLabel").innerHTML = bay.agent.baseEffectorIntensity[effectorType.RIGHTMOTOR];
	document.getElementById("rightMotorDial").value = bay.agent.baseEffectorIntensity[effectorType.RIGHTMOTOR]*10;
}

function toggleSimulation(newValue = !env.running) {
	env.running = newValue;
	document.getElementById("startButton").value = (env.running ? "Pause simulation" : "Continue simulation");

	if (env.tick > 10000 || Math.max(...env.numVeh) > 9 || env.epoch == 59) {
		env.startNewEpoch();
		return;

	}
	if (env.running) {
		env.step();
	}
}

function loadInfo() {
	newInfo = JSON.parse(window.prompt("Please enter the new Braitenberg vehicle and lightbulb information.",JSON.stringify(collapseBraitenbergInfo())));
	if (newInfo.bulbs) {
		setBulbNumber(newInfo.bulbs.length);
		for (var b = 0; b < newInfo.bulbs.length; ++b) {
			env.bulbs[b].x = newInfo.bulbs[b].x;
			env.bulbs[b].y = newInfo.bulbs[b].y;
		}
	}
	if (newInfo.vehicles) {
		setVehicleNumber(newInfo.vehicles.length);
		for (var v = 0; v < newInfo.vehicles.length; ++v) {
			loadAgentData(newInfo.vehicles[v], env.vehicles[v]);
		}
	}
	bay.load(env.vehicles[0]);
	requestRepaint();
}

function loadAgentData(agentSource, agentDestination, v) {
	loadNewPosition(agentDestination, v);
	agentDestination.angle = agentSource.angle;
	agentDestination.baseEffectorIntensity = agentSource.baseEffectorIntensity.slice();
	agentDestination.sensors = [];
	for (var s = 0; s < agentSource.sensors.length; ++s) {
		agentDestination.sensors.push(new BraitenbergSensor(agentSource.sensors[s].position, agentSource.sensors[s].effect, agentSource.sensors[s].strength, agentSource.sensors[s].type));
	}
}


function loadNewPosition(agentDestination, v) {
	var newPos = {x:0, y:0};
	do {
		agentDestination.x = Math.floor(Math.random() * 625);
		agentDestination.y = Math.floor(Math.random() * 500);
		if (agentDestination.x <= 30) {
			agentDestination.x = 30;
		}
		if (agentDestination.x >= 595) {
			agentDestination.x = 595;
		}
		if (agentDestination.y <= 30) {
			agentDestination.y = 30;
		}
		if (agentDestination.y >= 470) {
			agentDestination.y = 470;
		}
		newPos.x = agentDestination.x;
		newPos.y = agentDestination.y
	} while (!checkIfValid(v, newPos));
}


function checkIfValid (v, newPos) {
	for (var i = 0; i < v; ++i) {
		var dist = getDistance(env.vehicles[i], newPos);
		if (dist < env.vehicleSize * 2) {
			return false;
		}
	}
	return true;
}

function getDistance(pos1, pos2) {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

function loadVehicle() {
	var x = env.vehicles[bay.agent.id].x;
	var y = env.vehicles[bay.agent.id].y;
	var angle = env.vehicles[bay.agent.id].angle;
	loadAgentData(braitenbergInfo.vehicles[document.getElementById("vehicleSelectBox").selectedIndex], env.vehicles[bay.agent.id]);
	env.vehicles[bay.agent.id].x = x;
	env.vehicles[bay.agent.id].y = y;
	env.vehicles[bay.agent.id].angle = angle;
	bay.load(env.vehicles[bay.agent.id]);
	requestRepaint();
}

function collapseBraitenbergInfo() {
	var retVal = {vehicles: [], bulbs: []};
	for (var b = 0; b < env.numberOfBulbs; ++b) {
		retVal.bulbs.push({x: env.bulbs[b].x, y: env.bulbs[b].y});
	}
	for (var v = 0; v < env.numberOfVehicles; ++v) {
		retVal.vehicles.push({
			x: env.vehicles[v].x, 
			y: env.vehicles[v].y,
			angle: env.vehicles[v].angle,
			baseEffectorIntensity: env.vehicles[v].baseEffectorIntensity,
			sensors: env.vehicles[v].sensors
			});
	}
	return JSON.stringify(retVal);
}

function saveSetup() {
	var element = document.createElement('a');
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(collapseBraitenbergInfo()));
	element.setAttribute("download", "braitenberg.txt");
	element.style.display = "none";
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}



