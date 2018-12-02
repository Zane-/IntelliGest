import '../img/icon-128.png'
import '../img/icon-34.png'
// import {init} from './predict';

chrome.runtime.onInstalled.addListener(function() {
    return;
});


chrome.tabs.onActivated.addListener(function () {
    let vid = document.createElement("video");
    vid.setAttribute("autoplay", true);
    vid.setAttribute("playsinline", true);
    vid.setAttribute("muted", true);
    vid.setAttribute("width", "224");
    vid.setAttribute("height", "224");
    vid.setAttribute("id", "video");
    vid.setAttribute("style", "position:fixed;top:0;left:0;z-index:9999");
    document.body.appendChild(vid);
});

// init();