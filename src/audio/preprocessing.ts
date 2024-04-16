import { analyserNode, audioContext } from "./context";
import fft from "fourier-transform";
import blackman from "window-function/blackman";

function magnitudeToDB(magnitude: number) {
  return 20 * Math.log10(magnitude);
}

const fps = 60;
const fftSize = analyserNode.fftSize;
const frequencyBinCount = analyserNode.frequencyBinCount;

function getAudioSlice(buffer: AudioBuffer, start: number, end: number) {
  const channels = buffer.numberOfChannels;
  const length = end - start;
  const output = audioContext.createBuffer(
    channels,
    length,
    audioContext.sampleRate,
  );

  for (let i = 0; i < channels; i++) {
    const outputChannelData = output.getChannelData(i);
    const bufferChannelData = buffer.getChannelData(i);

    for (let j = start; j < end; j++) {
      outputChannelData[j - start] = bufferChannelData[j]!;
    }
  }

  return output;
}

function downmixAudioBuffer(buffer: AudioBuffer) {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const hasSingleChannel = numberOfChannels === 1;

  const output = new Float32Array(buffer.length);

  if (hasSingleChannel) {
    return buffer.getChannelData(0);
  }

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      output[i] += channelData[i]!;
    }
  }

  for (let i = 0; i < output.length; i++) {
    output[i] = output[i]! / numberOfChannels;
  }

  return output;
}

function getFloatTimeDomainData(buffer: AudioBuffer, array: Float32Array) {
  array.set(buffer.getChannelData(0));
}

function getFloatFrequencyData(
  buffer: AudioBuffer,
  array: Float32Array,
  blackmanTable: Float32Array,
) {
  const waveform = new Float32Array(fftSize);
  getFloatTimeDomainData(buffer, waveform);

  for (let i = 0; i < fftSize; i++) {
    waveform[i] = waveform[i]! * blackmanTable[i]! || 0;
  }

  const spectrum = fft(waveform);

  for (let i = 0, n = frequencyBinCount; i < n; i++) {
    const db = magnitudeToDB(spectrum[i]);
    array[i] = Number.isFinite(db) ? db : -Infinity;
  }
}

let maxVolume = 0.001;
function getNormalizedVolumeForBuffer(buffer: AudioBuffer): number {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const stereoVolume = [0, 0];

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    let sum = 0;
    for (let i = 0; i < length; i++) {
      const x = data[i]!;
      sum += x * x;
    }
    const rms = Math.sqrt(sum / length);
    stereoVolume[channel] = rms;
    maxVolume = Math.max(rms, maxVolume);
  }

  let volumeSum = 0;
  for (let i = 0; i < stereoVolume.length; i++) {
    volumeSum += stereoVolume[i]!;
  }

  const volume = volumeSum / stereoVolume.length;
  const normalizedVolume = Math.max(Math.min(volume / maxVolume, 1), 0);

  return normalizedVolume;
}

export async function preprocessTrackData(file: File) {
  const fileBuffer = await file.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(fileBuffer);
  const numberOfFrames = Math.floor(buffer.duration * fps);

  const fft: Float32Array[] = [];
  const amp: number[] = [];

  // reset maxVolume when processing new track data
  maxVolume = 0.001;

  for (let frame = 0; frame < numberOfFrames; frame++) {
    const time = frame / fps;
    const position = Math.floor((time / buffer.duration) * buffer.length);
    const start = Math.max(position - frequencyBinCount, 0);
    const end = Math.max(position + frequencyBinCount, 4096);
    const slice = getAudioSlice(buffer, start, end);

    const volume = getNormalizedVolumeForBuffer(slice);
    amp.push(volume);

    const downmixed = downmixAudioBuffer(slice);
    const downmixedBuffer = audioContext.createBuffer(
      1,
      fftSize,
      audioContext.sampleRate,
    );
    downmixedBuffer.copyToChannel(downmixed, 0);
    const fftArray = new Float32Array(frequencyBinCount);
    fftArray.fill(0);
    const blackmanTable = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      blackmanTable[i] = blackman(i, fftSize);
    }
    getFloatFrequencyData(downmixedBuffer, fftArray, blackmanTable);
    fft.push(fftArray);
  }

  return { numberOfFrames, fft, amp };
}
