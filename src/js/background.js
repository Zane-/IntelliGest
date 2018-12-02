import '../img/icon-128.png'
import '../img/icon-34.png'

chrome.runtime.onInstalled.addListener(function() {
    var options = {
        video:true,
        audio:false
    };

    var webStream, recorder;
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
        // reader.result contains the contents of blob as a typed array
    });
    navigator.webkitGetUserMedia(options, function(stream) {
        webStream = stream;
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = function(e) {
            reader.readAsArrayBuffer(e.data);
        };
        recorder.start(5000);
    }, function(e) {
        alert(e);
    });
});
