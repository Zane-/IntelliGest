import * as tf from '@tensorflow/tfjs';
import {Webcam} from './webcam';
import {gestureActions} from './gestures';

let model;
let mobilenet;
let gestures;

var video = document.getElementById('video');
const webcam = new Webcam(video);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function predict() {
	while (true) {
		var prediction = tf.tidy(() => {
			var img = webcam.capture();
			var activation = mobilenet.predict(img);
			var predictions = model.predict(activation);
			return predictions.as1D();
		});

		var probabilities = (await prediction.data());
		var maxProb = Math.max(...probabilities);
		var maxIndex = probabilities.indexOf(maxProb);
		console.log(probabilities);
		// execute the action in index maxIndex in the stored gestures array
		gestureActions[gestures[maxIndex]](maxProb);
		prediction.dispose();
		await tf.nextFrame();
	}
}

async function loadConfig() {
	try {
		model = await tf.loadModel('indexeddb://model-intelligest');
		chrome.storage.local.get(['intelligest-gestures'], function(value) {
			gestures = value['intelligest-gestures'];
		});
	} catch (e) {
		alert('No model saved, press "Ok" to be redirected to options...');
		window.location = './options.html';
	}
}

async function loadMobileNet() {
	const mobile = await tf.loadModel(
		'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
	const layer = mobile.getLayer('conv_pw_13_relu');
	return tf.model({
		inputs: mobile.inputs,
		outputs: layer.output
	});
}

export async function init() {
	try {
		await webcam.setup();
	} catch (e) {
		alert('No webcam detected. You must have a webcam enabled to use this extension. Please enable a webcam and press "Ok"');
		location.reload();
	}
	await loadConfig();
	mobilenet = await loadMobileNet();
	// hide loader
	document.getElementById('loading-overlay').style.display = 'none';
	console.log(gestures);
	// warm up model
	tf.tidy(() => mobilenet.predict(webcam.capture()));
	predict();
}

init();