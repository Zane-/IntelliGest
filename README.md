# IntelliGest
Gesture-based Chrome extension

### Building and Running
- To build the extension, run `yarn run build` or `npm run build` and then to start it run `yarn run start` or `npm run start`.
- Then visit chrome://extensions in the browser, turn on Developer mode, click 'Load unpacked extension', then choose the build folder

### TODO:
- [ ] Create background.js
  - This should inject a video element with id `'video'` in the DOM, and set it fixed to the top left. The only way we can read webcam data right now is from an actual webcam preview on the screen. There must be a workaround though.
  - It should then run init() from predict.js. All this needs to work is a working Webcam object, which needs with video element with the webcam preview.
