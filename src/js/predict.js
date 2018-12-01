import * as tf from '@tensorflow/tfjs';
import { Webcam } from './webcam.js';

let model;
let mobilenet;

var video = document.getElementById('video');

var options = {
	video: true,
	audio: false
};

var recorder;

navigator.webkitGetUserMedia(options, function (stream) {
	video.src = window.URL.createObjectURL(stream);
	video.srcObject = stream;
	recorder = new MediaRecorder(stream);
	recorder.ondataavailable = function (e) {
		console.log(e.data.size);
	};
	recorder.start(5000);
	video.play();
}, function (e) {
	alert(e);
});

const webcam = new Webcam(video);


async function loadMobileNet() {
	const mobile = await tf.loadModel(
		'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
	const layer = mobile.getLayer('conv_pw_13_relu');
	return tf.model({ inputs: mobile.inputs, outputs: layer.output });
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
		var max = Math.max(...probabilities);
		if (max >= 0.7) {
			var direction = probabilities.indexOf(max);
			switch (direction) {
				case 0:
					window.scrollBy(0, -20);
					break;
				case 1:
					break;
				case 2:
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
	document.getElementById('status').style.display = 'none';
	tf.tidy(() => mobilenet.predict(webcam.capture()));
	predict();
}

init();
