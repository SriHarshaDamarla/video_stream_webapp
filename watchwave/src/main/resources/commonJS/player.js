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
const buffElement = document.getElementsByClassName("buffer-div").item(0);

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
        let isPauseCalled = false;
        if(!video.paused){
            video.pause();
            isPauseCalled = true;
        }
        buffElement.style.display = "flex";
        hls.currentLevel = this.value;
        setTimeout(function () {
            if(isPauseCalled){
                video.play();
            }
        }, 1000);
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
        hls.audioTrack = parseInt(this.value);
    });

    subtitleTracksSelect.addEventListener("change", () => {
        hls.subtitleTrack = subtitleTracksSelect.value;
    });
}

playPauseButton.addEventListener("click", () => {
    playPauseButton.innerHTML ="";
    var icon =document.createElement("i");
    icon.classList.add("ph-bold");
    if (video.paused) {
        video.play();
        icon.classList.add("ph-pause-circle");
        playPauseButton.appendChild(icon);
    } else {
        video.pause();
        icon.classList.add("ph-play-circle");
        playPauseButton.appendChild(icon);
    }
});

video.addEventListener("playing", function () {
   buffElement.style.display = "none";
});
video.addEventListener("waiting", function () {
    buffElement.style.display = "flex";
});

video.addEventListener("timeupdate", () => {
    let tt = video.textTracks;
    for(let i = 0; i < tt.length; i++) {
        tt[i].mode = 'hidden';
    }
    if(!isEventAdded){
        let tt = video.textTracks;
        for(let i=0; i<tt.length;i++){
            tt[i].addEventListener("cuechange",function () {
                const index = i;
                if(index === parseInt(subtitleTracksSelect.value)){
                    let ac = tt[index].activeCues;
                    if(ac && ac.length == 0){
                        subElement.innerHTML = "";
                    } else if(ac && ac.length > 0){
                        subElement.innerHTML = "";
                        for(let j=0; j<ac.length; j++){
                            let pEle = document.createElement("p");
                            const subText = ac[j].text;
                            pEle.innerHTML = ""+subText;
                            pEle.innerHTML = pEle.innerHTML.replace("\n","<br>");
                            subElement.appendChild(pEle);
                        }
                    }
                }
            });
        }
        isEventAdded = true;
    }
    let buffer = video.buffered;
    let bufferedTill = buffer.end(buffer.length-1);
    bufferedTill = bufferedTill - video.currentTime;
    let pcnt = (bufferedTill / video.duration) * 100;
    seekBar.value = (video.currentTime / video.duration) * 100;
    durationElement.innerHTML = "";
    durationElement.innerHTML = getTimeStamp(video.duration);
    currentTimeElement.innerHTML = "";
    currentTimeElement.innerHTML = getTimeStamp(video.currentTime);
    pcnt = parseInt(seekBar.value)+pcnt;
    seekBar.style.background = `linear-gradient(to right, #d6336c 0%, #d6336c ${seekBar.value}% ,#fcc2d7 ${seekBar.value}%,#fcc2d7 ${pcnt}%,#f8f9fa ${pcnt}%, #f8f9fa 100%)`;
});

seekBar.addEventListener("input", () => {
    video.currentTime = (seekBar.value / 100) * video.duration;
    let buffer = video.buffered;
    let bufferedTill = buffer.end(buffer.length-1);
    bufferedTill = bufferedTill - video.currentTime;
    let pcnt = (bufferedTill / video.duration) * 100;
    pcnt = parseInt(seekBar.value)+pcnt;
    seekBar.style.background = `linear-gradient(to right, #d6336c 0%, #d6336c ${seekBar.value}% ,#fcc2d7 ${seekBar.value}%,#fcc2d7 ${pcnt}%,#f8f9fa ${pcnt}%, #f8f9fa 100%)`;
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
       subElement.style.fontSize = '35px';
       var icon =document.createElement("i");
       icon.classList.add("ph-bold");
       icon.classList.add("ph-corners-in");
       fullScreenButton.appendChild(icon);
   }else {
       isFullScreen = false;
       subElement.style.fontSize = '25px';
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
    }, 3000);
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
