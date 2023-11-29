import { create } from "zustand";

const audioContext = new AudioContext();
const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 4096;
analyserNode.connect(audioContext.destination);

type AudioStore = {
  audio: HTMLAudioElement;
  audioFile: File | null;
  setAudioFile: (audioFile: File | null) => void;
  isPlaying: boolean;
  duration: number;
  elapsed: number;
  volume: number;
};
const audio = new Audio();
export const useAudioStore = create<AudioStore>()((set) => ({
  audio,
  audioFile: null,
  setAudioFile: (audioFile: File | null) => {
    set({ audioFile });
    if (audioFile) {
      audio.src = URL.createObjectURL(audioFile);
    } else {
      audio.src = "";
    }
  },
  isPlaying: false,
  duration: 0,
  elapsed: 0,
  volume: 1,
}));
audio.addEventListener("loadedmetadata", () => {
  useAudioStore.setState({ duration: audio.duration });
});
audio.addEventListener("timeupdate", () => {
  useAudioStore.setState({ elapsed: audio.currentTime });
});
audio.addEventListener("play", () => {
  useAudioStore.setState({ isPlaying: true });
});
audio.addEventListener("pause", () => {
  useAudioStore.setState({ isPlaying: false });
});
audio.addEventListener("volumechange", () => {
  useAudioStore.setState({ volume: audio.volume });
});
document.addEventListener("keydown", (e) => {
  if (document.activeElement && document.activeElement.tagName !== "BODY")
    return;
  if (e.key === " ") {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
});

const sourceNode = audioContext.createMediaElementSource(audio);
sourceNode.connect(analyserNode);

const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
const timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);

export const getFrequencyData = () => {
  analyserNode.getByteFrequencyData(frequencyData);
  return frequencyData;
};

export const getTimeDomainData = () => {
  analyserNode.getByteTimeDomainData(timeDomainData);
  return timeDomainData;
};
