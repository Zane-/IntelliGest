# IntelliGest
Gesture-based Chrome extension

### Building and Running
- To build the extension, run `yarn run build` or `npm run build` and then to start it run `yarn run start` or `npm run start`.
- Then visit chrome://extensions in the browser, turn on Developer mode, click 'Load unpacked extension', then choose the build folder

### TODO:
- [ ] Create options page (options.html in src)
  - Options should have a webcam preview with a capture button, and then a dropdown list that selects the action to apply to the captured gesture.
  - Users should also be able to view and delete saved gestures.
  
- [ ] Create extension popup (popup.html in src)
  - This is what shows up when you click the extension icon in Chrome.
  - Users should be able to toggle the extension on and off and visit the options page.
  
- [ ] Get background.js working
  - This is the background javascript file injected into other webpages. We should make sure this is working by just drawing a box on pages or anything else observable.
  
- [ ] Create webcam.js
  - We need to figure out how to capture webcam data without having a webcam preview rendered on screen
  - This module should be able to return cropped, normalized image data from the webcam so it can be used for training and predicting.

- [ ] Create training logic for options page
  - This should take webcam data once the user presses "Capture", add the image to the model, and then add the gesture to some data structure so that it lines up with with the array of probabilities that is returned by the predictive model.
  - For example, if we have actions `['scroll-left', 'scroll-right', 'scroll-up', 'scroll-down']`, index 0 in the array of probabilities should correspond to `scroll-left`, and so on.
  - We also need to support deleting gestures, need to figure out how to remove things from the model (if even possible). May need to hard reset all gestures.
  - A neutral gesture is also required as without this the extension would be constantly trying to do an action.
  
- [ ] Create background.js
  - This should capture webcam data every x frames, get the model's predictions, and execute an action if the highest probability is above a given threshold.
