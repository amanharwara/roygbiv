export const audioContext = new AudioContext();

const audioElement = new Audio();
export const playAudio = () => audioElement.play();
export const pauseAudio = () => audioElement.pause();
export const resetAudio = () => {
  audioElement.pause();
  audioElement.currentTime = 0;
};
export const isAudioPaused = () => audioElement.paused;
export const setAudioSrc = (src: string) => (audioElement.src = src);

export const sourceNode = audioContext.createMediaElementSource(audioElement);

export const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 4096;
analyserNode.connect(audioContext.destination);
analyserNode.smoothingTimeConstant = 0.8;
sourceNode.connect(analyserNode);
