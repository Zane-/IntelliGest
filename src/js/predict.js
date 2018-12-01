import * as tf from '@tensorflow/tfjs';
import {
	Webcam
} from './webcam.js';

let model;
let mobilenet;

var video = document.getElementById('video');
const webcam = new Webcam(video);

async function loadMobileNet() {
	const mobile = await tf.loadModel(
		'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
	const layer = mobile.getLayer('conv_pw_13_relu');
	return tf.model({
		inputs: mobile.inputs,
		outputs: layer.output
	});
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
		// threshold values for executing actions probability 
		// must exceed the threshold for the given action to execute
		const thresholds = [0.7, 0.5, 0.7];
		if (maxProb >= thresholds[maxIndex]) {
			switch (maxIndex) {
				case 0:
					// scroll up
					window.scrollBy(0, -20);
					break;
				case 1:
					// neutral gesture detected, do nothing
					break;
				case 2:
					// scroll down
					window.scrollBy(0, 20);
					break;
			}
		}
		prediction.dispose();
		await tf.nextFrame();
	}
}

async function init() {
	try {
		await webcam.setup();
	} catch (e) {
		// div with id 'no-webcam' can be added to be shown when user does not have a webcam
		document.getElementById('no-webcam').style.display = 'block';
	}
	model = await tf.loadModel('indexeddb://model-intelligest');
	mobilenet = await loadMobileNet();
	// hide loader
	document.getElementById('loading-status').style.display = 'none';

	tf.tidy(() => mobilenet.predict(webcam.capture()));
	predict();
}

init();