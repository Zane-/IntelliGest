import "../css/options.css";

var video = document.getElementById('video');

var options = {
    video:true,
    audio:false
};

var recorder;

navigator.webkitGetUserMedia(options, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    video.srcObject = stream;
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = function(e) {
        console.log(e.data.size);
    };
    recorder.start(5000);
    video.play();
}, function(e) {
    alert(e);
});
