import * as tf from '@tensorflow/tfjs';

const CONTROLS = ['up', 'neutral', 'down'];
const trainStatusElement = document.getElementById('train-status');
const errorTextElement = document.getElementById('error-text');

export function trainStatus(status) {
  trainStatusElement.innerText = status;
}

export function setErrorText(text) {
  errorTextElement.innerText = text;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}

let mouseDown = false;
export const totals = [0, 0, 0];

const upButton = document.getElementById('up');
const neutralButton = document.getElementById('neutral');
const downButton = document.getElementById('down');

const thumbDisplayed = {};

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const button = document.getElementById(className);
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute('data-active', CONTROLS[label]);

    if (totals[label] == 1) {
      total.innerText = totals[label]++ + " Example";
    } else {
      total.innerText = totals[label]++ + " Examples";
    }

    await tf.nextFrame();
  }
  document.body.removeAttribute('data-active');
}

upButton.addEventListener('mousedown', () => handler(0));
upButton.addEventListener('mouseup', () => mouseDown = false);

neutralButton.addEventListener('mousedown', () => handler(1));
neutralButton.addEventListener('mouseup', () => mouseDown = false);

downButton.addEventListener('mousedown', () => handler(2));
downButton.addEventListener('mouseup', () => mouseDown = false);


export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

export function draw(image, canvas) {
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