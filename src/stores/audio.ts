import { atom, getDefaultStore } from "jotai";

const audioContext = new AudioContext();

const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 64;

const defaultStore = getDefaultStore();

export const audio = new Audio();
export const isAudioPlayingAtom = atom(false);
export const audioDurationAtom = atom(0);
export const audioElapsedAtom = atom(0);
export const audioVolumeAtom = atom(1);
audio.addEventListener("loadedmetadata", () => {
  defaultStore.set(audioDurationAtom, audio.duration);
});
audio.addEventListener("timeupdate", () => {
  defaultStore.set(audioElapsedAtom, audio.currentTime);
});
audio.addEventListener("play", () => {
  defaultStore.set(isAudioPlayingAtom, true);
});
audio.addEventListener("pause", () => {
  defaultStore.set(isAudioPlayingAtom, false);
});
audio.addEventListener("volumechange", () => {
  defaultStore.set(audioVolumeAtom, audio.volume);
});

export const audioFileAtom = atom<File | null>(null);
defaultStore.sub(audioFileAtom, () => {
  const file = defaultStore.get(audioFileAtom);
  if (file) {
    audio.src = URL.createObjectURL(file);
  } else {
    audio.src = "";
  }
});
