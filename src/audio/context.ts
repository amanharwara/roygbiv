export const audioContext = new AudioContext();

export const audioElement = new Audio();
export const playAudio = () => audioElement.play();
export const pauseAudio = () => audioElement.pause();
export const resetAudio = () => {
  audioElement.pause();
  audioElement.currentTime = 0;
};
export const isAudioPaused = () => audioElement.paused;
export const setAudioSrc = (src: string) => (audioElement.src = src);

document.addEventListener("keydown", (event) => {
  if (document.activeElement && document.activeElement !== document.body) {
    return;
  }

  if (event.key === " ") {
    if (isAudioPaused()) {
      playAudio();
    } else {
      pauseAudio();
    }
  }
});

export const sourceNode = audioContext.createMediaElementSource(audioElement);

export const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 4096;
analyserNode.smoothingTimeConstant = 0;
analyserNode.minDecibels = -85;
analyserNode.maxDecibels = -25;
analyserNode.connect(audioContext.destination);
sourceNode.connect(analyserNode);
