/*  Braitenberg vehicles
 *  Arena constants
 *  Copyright 2021 Harmen de Weerd
 */

effectorType = {
	NONE: -1,
	LEFTMOTOR: 0,
	RIGHTMOTOR: 1,
	BULB: 2
};

sensorType = {
	LIGHT: 0,
	DISTANCE: 1
};

sensorColors = {};
sensorColors[effectorType.LEFTMOTOR] = "#FFFFFF";
sensorColors[effectorType.RIGHTMOTOR] = "#000000";
sensorColors[effectorType.BULB] = "#ffff00";

braitenbergConstants = {
	bay: {
		vehicleSize: 40,
		maxSensors: 8,
		sensorArrowColor: "#FF0000",
	},
	vehicle: {
		defaultColor: "#FF0000",
		baseColor: "#DDDDDD",
		size: 5,
		maxSpeed: 20,
		detectionRange: 120
	},
	stepDelay: 14,
	bulbSize: 2.5,
	baseArenaColor: "#000000",
};

experiment = {
	totalExperiments: -1, //start at -1
	phase: 1,
	experimentType: 0,
	dataGraphOne: Array(60).fill().map(() => Array(1).fill(0)),
	dataGraphTwo: Array(10).fill(0),
	dataGraphThree: Array(11).fill(0),
	totalTicks: 0,
	totalTicksSquared: 0,
	totalEpochs: 0,
	totalEpochsSquared: 0
};



braitenbergInfo = {
	vehicles: [ 
		{ // II.cntr.pos.R (Aggression)
			color: "red",
			angle: 0, 
			baseEffectorIntensity: [ 0.2, 0.2, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.RIGHTMOTOR, 
					type: sensorType.LIGHT,
					strength: 1
				}, {
					position: Math.PI/4, 
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: 1
			}]
		}, { // II.ipsi.neg.Bl (Love)
			color: "blue",
			angle: 0, 
			baseEffectorIntensity: [1, 1, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.4
				}, {
					position: Math.PI/4, 
					effect: effectorType.RIGHTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.4
				}]
		}, { // II.ipsi.neg.G (Fear)
			color: "green",
			angle: 0, 
			baseEffectorIntensity: [0.2, 0.2, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: 3
				}, {
					position: Math.PI/4, 
					effect: effectorType.RIGHTMOTOR, 
					type: sensorType.LIGHT,
					strength: 3
				}]
		}, { // II.cntr.neg.W (Exploration)
			color: "white",
			angle: 0, 
			baseEffectorIntensity: [0.8, 0.8, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.RIGHTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.2
				}, {
					position: Math.PI/4, 
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.2
				}]
		}, { // II.cntr.neg.P
			color: "pink",
			angle: 0, 
			baseEffectorIntensity: [.6, .6, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.RIGHTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.4
				}, {
					position: Math.PI/4, 
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: -0.4
				}]
		}, { // II.cntr.mix.Y
			color: "yellow",
			angle: 0, 
			baseEffectorIntensity: [.6, .6, 0],
			sensors: [{
					position: -Math.PI/4, 
					effect: effectorType.RIGHTMOTOR,
					type: sensorType.LIGHT,
					strength: -0.9
				}, {
					position: Math.PI/4, 
					effect: effectorType.LEFTMOTOR,
					type: sensorType.LIGHT,
					strength: 0.9
				}]
		}, { // II.cntr.pos.C
			color: "cyan",
			angle: 0, 
			baseEffectorIntensity: [0.2, 0.4, 0],
			sensors: [{
					position: -Math.PI/4,
					effect: effectorType.RIGHTMOTOR,
					type: sensorType.LIGHT,
					strength: 1
				}, {
					position: Math.PI/4,
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: 3
				}]
		}, { // II.cntr.pos.M
			color: "magenta",
			angle: 0, 
			baseEffectorIntensity: [0.2, 0.8, 0],
			sensors: [{
					position: -Math.PI/4,
					effect: effectorType.RIGHTMOTOR, 
						type: sensorType.LIGHT,
					strength: 2
				}, {
					position: Math.PI/4,
					effect: effectorType.LEFTMOTOR, 
					type: sensorType.LIGHT,
					strength: 2
				}]
		}, { // II.cntr.pos.A
			color: "aquamarine",
			angle: 0,
			baseEffectorIntensity: [0.24, 0.2, 0],
			sensors: [{
				position: -Math.PI/4,
				effect: effectorType.RIGHTMOTOR,
				type: sensorType.LIGHT,
				strength: 0.5
			}, {
				position: Math.PI/4,
				effect: effectorType.LEFTMOTOR,
				type: sensorType.LIGHT,
				strength: 0.5
			}]
		}, { //II.cntr.pos.Br
			color: "brown",
			angle: 0,
			baseEffectorIntensity: [0.4, 0.4, 0],
			sensors: [{
				position: -Math.PI/4,
				effect: effectorType.RIGHTMOTOR,
				type: sensorType.LIGHT,
				strength: 0.2
			}, {
				position: Math.PI/4,
				effect: effectorType.LEFTMOTOR,
				type: sensorType.LIGHT,
				strength: 0.2
			}]
		}],
	bulbs: [{ // top left
			x: 125,
			y: 125
		}, { // bottom left
			x: 125,
			y: 375
		}, { // top right
			x: 500,
			y: 125
		}, { // bottom right
			x: 500,
			y: 375
		}, { // middle
			x: 312.5,
			y: 250
		},  { // bottom left
			x: 125,
			y: 375
		}, { // bottom right
			x: 500,
			y: 375
		}, { // top left
			x: 125,
			y: 125
		}, { // top right
			x: 500,
			y: 125
		}, { //bottom right #1
			x: 575,
			y: 450
		}, { //top right #1
			x: 575,
			y: 50
		}, { //top left #1
			x: 50,
			y: 50
		}, { //bottom left #1
			x: 50,
			y: 450
		}, { //bottom right #2
			x: 525,
			y: 400
		}, { //top right #2
			x: 525,
			y: 100
		}, { //top left #2
			x: 100,
			y: 100
		}, { //bottom left #2
			x: 100,
			y: 400
		}, { //bottom right #3
			x: 425,
			y: 300
		}, { //top right #3
			x: 425,
			y: 200
		}, { //top left #3
			x: 200,
			y: 200
		}, { //bottom left #3
			x: 200,
			y: 300
		}]
};
