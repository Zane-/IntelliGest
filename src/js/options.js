import "../css/options.css";
import {ControllerDataset} from './controller';
import {Webcam} from './webcam';

import * as tf from '@tensorflow/tfjs';

const trainStatusElement = document.getElementById('train-status');
const errorTextElement = document.getElementById('error-text');
const gesturesElement = document.getElementById('gestures');
const neutralGesture = document.getElementById('neutral-gesture');
const neutralButton = document.getElementById('neutral');
const trainButton = document.getElementById('train');
trainButton.addEventListener('click', startTraining);
const video = document.getElementById('video');
const webcam = new Webcam(video);

let gestures = ['neutral'];
let totals = [0];
let thumbDisplayed = {};
let mouseDown = false;
var controllers = [];
var mnet;
var mdl;

// add listeners to dropdown buttons to add component to gestures table
document.getElementById('add-scroll-up').addEventListener('click', () => addGesture('scroll-up', 'Scroll up'));
document.getElementById('add-scroll-down').addEventListener('click', () => addGesture('scroll-down', 'Scroll down'));
document.getElementById('add-tab-prev').addEventListener('click', () => addGesture('tab-prev', 'Prev tab'));
document.getElementById('add-tab-next').addEventListener('click', () => addGesture('tab-next', 'Next tab'));
document.getElementById('add-tab-close').addEventListener('click', () => addGesture('tab-close', 'Close tab'));
document.getElementById('add-tab-new').addEventListener('click', () => addGesture('tab-new', 'New tab'));

document.getElementById('test-model').addEventListener('click', async() => {
  try {
    let model = await tf.loadModel('indexeddb://model-intelligest');
    window.location = './demo.html';
	} catch (e) {
    window.scrollTo(0, 0);
		setErrorText('No model saved, please train a model first.');
  }
});

function checkWebcam() {
  let offset = video.offsetTop;
  if (window.pageYOffset > offset) {
    setHidden('webcam-title', true);
    errorTextElement.classList.add('hidden');
    video.classList.add("webcam-fixed");
  } else {
    setHidden('webcam-title', false);
    errorTextElement.classList.remove('hidden');
    video.classList.remove("webcam-fixed");
  }
}

function setHidden(element, bool) {
  if (bool) {
    document.getElementById(element).classList.add('hidden');
  } else {
    document.getElementById(element).classList.remove('hidden');
  }
}

function setTrainStatus(status) {
  trainStatusElement.innerText = status;
}

function setErrorText(text) {
  errorTextElement.innerText = text;
}

function startTraining() {
  let children = gesturesElement.childNodes;
  if (children.length <= 3) {
    window.scrollTo(0, 0);
    setErrorText("Please add at least one other gesture.");
    return;
  }
  setErrorText("No errors to report.");
  // hide the dropdown to add gestures
  setHidden("gestures-dropdown", true);
  document.getElementById('train-btn-col').classList.add('offset-md-4');

  const numGestures = gestures.length;
  // unhide all the add example buttons
  for (let i = 0; i < numGestures; i++) {
    let id = gestures[i];
    setHidden(id, false);
    setHidden(id+'-total', false);
    // skip neutral gesture because it already has these handlers
    let elem = document.getElementById(id);
    const labelIndex = i;
    elem.addEventListener('mousedown', () => handler(labelIndex));
    elem.addEventListener('mouseup', () => mouseDown = false);
  }
  controllers.push(new ControllerDataset(numGestures));
  trainButton.removeEventListener('click', this);
  setTrainStatus("Train model");

  trainButton.addEventListener('click', async() =>  {
    setErrorText('No errors to report.');
    setTrainStatus('Training...');
    await tf.nextFrame();
    await tf.nextFrame();
    await train();
    setTrainStatus('Model saved');
    chrome.storage.local.set({'intelligest-gestures': gestures}, function() {
      console.log('Storing gestures configuration as ' + gestures);
    });
  });
}

function addGesture(label, title) {
  // clone the original neutral gesture
  let newGesture = neutralGesture.cloneNode(true);
  newGesture.id = label + '-gesture';
  // array of the four rows in a gesture
  // set ids to the correct label
  let rows = newGesture.childNodes;
  rows[1].innerText = title;
  rows[3].firstChild.id = label + '-thumb';
  rows[5].firstChild.id = label;
  rows[7].firstChild.id = label + '-total';

  gesturesElement.appendChild(newGesture);

  gestures.push(label);
  totals.push(0);
  // remove gesture from dropdown list
  let dropdownElement = document.getElementById('add-' + label);
  dropdownElement.parentNode.removeChild(dropdownElement);
}

async function handler(label) {
  mouseDown = true;
  const className = gestures[label];
  console.log(className);
  console.log(label);
  const button = document.getElementById(className);
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    tf.tidy(() => {
      const img = webcam.capture();
      controllers[0].addExample(mnet.predict(img), label);
      // Draw the preview thumbnail
      drawThumb(img, label);
    });
    document.body.setAttribute('data-active', gestures[label]);
    let text = (totals[label] == 1) ? " Example" : " Examples";
    total.innerText = ++totals[label] + text;

    await tf.nextFrame();
  }
  document.body.removeAttribute('data-active');
}

function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(gestures[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Sets up and trains the classifier.
 */
async function train() {
  if (controllers[0].xs == null) {
    window.scrollTo(0, 0);
    setTrainStatus('Train model');
    setErrorText('Add some examples before training!');
    throw new Error('Add some examples before training!');
  }
  for (let i = 0; i < totals.length; i++) {
    if (totals[i] < 100) {
      window.scrollTo(0, 0);
      setTrainStatus('Train model');
      setErrorText('Add at least 100 examples for each gesture!');
      throw new Error('Add at least 100 examples for each gesture!');
      break;
    }
  }

  let units = gestures.length;
  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  mdl = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({
        inputShape: [7, 7, 256]
      }),
      // Layer 1
      tf.layers.dense({
        // number of hidden units
        units: 30,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: units,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  // 0.0001 is the learning rate
  const optimizer = tf.train.adam(0.001);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  mdl.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy'
  });

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends onhow many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(controllers[0].xs.shape[0]);

  mdl.fit(controllers[0].xs, controllers[0].ys, {
    batchSize,
    epochs: 10
  });
  await mdl.save('indexeddb://model-intelligest');
}

// Loads mobilenet and returns a model
async function loadMobilenet() {
  const mobilenet = await tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  // mobilenetv2
  // const mobilenet = await tf.loadModel('http://zane-.github.io/tfjs/mobilenetv2/model.json');
  console.log(mobilenet.layers);
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({
    inputs: mobilenet.inputs,
    outputs: layer.output
  });
}

async function init() {
  try {
    await webcam.setup();
  } catch (e) {
   	alert('No webcam detected. You must have a webcam enabled to use this extension. Please enable a webcam and press "Ok"');
		location.reload();
  }
  mnet = await loadMobilenet();
  // hide loading screen once mobilenet is loaded
  setHidden('loading-overlay', true);
  window.onscroll = function() {checkWebcam()};
  tf.tidy(() => mnet.predict(webcam.capture()));
}

init();
