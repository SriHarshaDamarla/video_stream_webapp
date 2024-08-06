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

var isFullScreen = false;

if (Hls.isSupported()) {
    const hls = new Hls();
    var movieTitle = video.getAttribute("data-title");
    hls.loadSource('/load/'+movieTitle+'/master_list.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Video ready to play!");
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data){
       var availableQualities = hls.levels.map(level => level.height);
        availableQualities.forEach((quality, index) => {
            var option = document.createElement('option');
            option.value = index;
            option.text = quality + 'p';
            resolutionSelect.appendChild(option);
            resolutionSelect.options.selectedIndex = 0;
            hls.currentLevel = resolutionSelect.value;
        });
    });

    resolutionSelect.addEventListener('change', function() {
        hls.currentLevel = this.value;
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
    seekBar.value = (video.currentTime / video.duration) * 100;
});

seekBar.addEventListener("input", () => {
    console.log(video.duration);
    video.currentTime = (seekBar.value / 100) * video.duration;
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
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        controls.classList.remove('display-flex');
        videoContainer.classList.remove('display-cursor');
    }, 5000);
});
