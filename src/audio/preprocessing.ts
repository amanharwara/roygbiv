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

export async function analyzeTrackData(file: File) {
  const fileBuffer = await file.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(fileBuffer);
  const numberOfFrames = Math.floor(buffer.duration * fps);

  const fftFrames: Float32Array[] = [];

  for (let frame = 0; frame < numberOfFrames; frame++) {
    const time = frame / fps;
    const position = Math.floor((time / buffer.duration) * buffer.length);
    const start = position - frequencyBinCount;
    const end = position + frequencyBinCount;
    const slice = getAudioSlice(buffer, start, end);
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
    fftFrames.push(fftArray);
  }

  return fftFrames;
}
