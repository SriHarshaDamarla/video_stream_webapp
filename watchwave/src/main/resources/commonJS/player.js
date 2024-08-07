const video = document.getElementById("video");
const playPauseButton = document.getElementById("play-pause");
const seekBar = document.getElementById("seek-bar");
const muteButton = document.getElementById("mute");
const volumeBar = document.getElementById("volume-bar");
const fullScreenButton = document.getElementById("full-screen");
const audioTracksSelect = document.getElementById("audio-tracks");
const subtitleTracksSelect = document.getElementById("subtitle-tracks");
const resolutionSelect = document.getElementById("resolution");
const videoContainer = document.getElementsByClassName("video-container").item(0);
const currentTimeElement = document.getElementById("currentStamp");
const durationElement = document.getElementById("totalDuration");
const subElement = document.getElementById("subtitles-container");

var isFullScreen = false;
var isResolutionSet = false;
let isEventAdded = false;

if (Hls.isSupported()) {
    const hls = new Hls();
    var movieTitle = video.getAttribute("data-title");
    hls.loadSource('/load/'+movieTitle+'/master_list.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Video ready to play!");
    });

    resolutionSelect.addEventListener('change', function() {
        hls.currentLevel = this.value;
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data){
       var availableQualities = hls.levels.map(level => level.height);
       if(!isResolutionSet){
           availableQualities.forEach((quality, index) => {
               var option = document.createElement('option');
               option.value = index;
               option.text = quality + 'p';
               resolutionSelect.appendChild(option);
           });
           resolutionSelect.value = resolutionSelect.options.length -1;
       }
    });

    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, function (event, data) {
        console.log("Audio tracks updated:", data.audioTracks);
        var audioTracks = data.audioTracks;
        audioTracksSelect.innerHTML = "";
        audioTracks.forEach(function (track, index) {
            var option = document.createElement("option");
            option.value = index;
            option.text =
                track.name || track.lang || track.title || `Audio Track ${index + 1}`;
            audioTracksSelect.appendChild(option);
        });
    });

    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        const subtitleTracks = hls.subtitleTracks;
        subtitleTracksSelect.innerHTML = "";
        subtitleTracks.forEach((track, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = track.name || `Subtitle Track ${index + 1}`;
            subtitleTracksSelect.appendChild(option);
        });
    });

    audioTracksSelect.addEventListener("change", function () {
        var selectedAudioTrack = parseInt(this.value);
        hls.audioTrack = selectedAudioTrack;
    });

    subtitleTracksSelect.addEventListener("change", () => {
        hls.subtitleTrack = subtitleTracksSelect.value;
        let tt = video.textTracks;
        for(let i = 0; i < tt.length; i++) {
            if(i == subtitleTracksSelect.value){
                tt[i].mode = 'showing';
            } else {
                tt[i].mode = 'disabled';
            }
        }
    });
}

playPauseButton.addEventListener("click", () => {
    playPauseButton.innerHTML ="";
    var icon =document.createElement("i");
    icon.classList.add("ph-bold");
    if (video.paused) {
        video.play();
        icon.classList.add("ph-pause-circle");
    } else {
        video.pause();
        icon.classList.add("ph-play-circle");
    }
    playPauseButton.appendChild(icon);
});

video.addEventListener("timeupdate", () => {
    if(!isEventAdded){
        let tt = video.textTracks;
        for(let i=0; i<tt.length;i++){
            tt[i].addEventListener("cuechange",function () {
                if(tt[i].mode == 'showing'){
                    let ac = tt[i].activeCues;
                    if(ac && ac.length == 0){
                        subElement.innerHTML = "";
                    } else if(ac && ac.length > 0){
                        subElement.innerHTML = "";
                        for(let j=0; j<ac.length; j++){
                            let pEle = document.createElement("p");
                            pEle.innerHTML = ac[j].text;
                            pEle.innerHTML = pEle.innerHTML.replace("\n","<br>");
                            subElement.appendChild(pEle);
                        }
                    }
                }
            });
        }
        isEventAdded = true;
    }
    seekBar.value = (video.currentTime / video.duration) * 100;
    durationElement.innerHTML = "";
    durationElement.innerHTML = getTimeStamp(video.duration);
    currentTimeElement.innerHTML = "";
    currentTimeElement.innerHTML = getTimeStamp(video.currentTime);
    seekBar.style.background = `linear-gradient(to right, #d6336c ${seekBar.value}% , #f8f9fa ${seekBar.value}%)`;
});

seekBar.addEventListener("input", () => {
    video.currentTime = (seekBar.value / 100) * video.duration;
    seekBar.style.background = `linear-gradient(to right, #d6336c ${seekBar.value}% , #f8f9fa ${seekBar.value}%)`;
});

muteButton.addEventListener("click", () => {
    video.muted = !video.muted;
    muteButton.innerHTML ="";
    var icon =document.createElement("i");
    icon.classList.add("ph-bold");
    if (video.muted) {
        icon.classList.add("ph-speaker-slash")
    } else{
        icon.classList.add("ph-speaker-high");
    }
    muteButton.appendChild(icon);
});

volumeBar.addEventListener("input", () => {
    video.volume = volumeBar.value;
});

fullScreenButton.addEventListener("click", () => {
    if (!isFullScreen) {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
            // Firefox
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            // Chrome and Safari
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            // IE/Edge
            videoContainer.msRequestFullscreen();
        }
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", function () {
    fullScreenButton.innerHTML ="";
   if(document.fullscreenElement){
       isFullScreen = true;
       var icon =document.createElement("i");
       icon.classList.add("ph-bold");
       icon.classList.add("ph-corners-in");
       fullScreenButton.appendChild(icon);
   }else {
       isFullScreen = false;
       var icon =document.createElement("i");
       icon.classList.add("ph-bold");
       icon.classList.add("ph-corners-out");
       fullScreenButton.appendChild(icon);
   }
});
let timeout;
videoContainer.addEventListener("mousemove", function () {
    var controls = document.getElementsByClassName("controls").item(0);
    controls.classList.add('display-flex');
    videoContainer.classList.add('display-cursor');
    subElement.classList.add('subtitles-transform');
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        controls.classList.remove('display-flex');
        videoContainer.classList.remove('display-cursor');
        subElement.classList.remove('subtitles-transform');
    }, 5000);
});

function getTimeStamp(seconds){
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    var hours = Math.floor(minutes / 60);
    var remainingMinutes = minutes % 60;
    var totalDuration = hours == 0 ? "00:" : hours+":";
    totalDuration = totalDuration + (remainingMinutes == 0 ? "00:" : remainingMinutes < 10 ? "0"+remainingMinutes+":" : remainingMinutes+":");
    totalDuration = totalDuration + (remainingSeconds == 0 ? "00" : remainingSeconds < 10 ? "0"+remainingSeconds : remainingSeconds);
    return totalDuration;
}
