/**
 * Some of the utility functions have been taken from audioMotion-analyzer
 * https://github.com/hvianna/audioMotion-analyzer/blob/master/src/audioMotion-analyzer.js
 */

import { constrainNumber } from "../utils/numbers";
import { analyserNode, audioContext } from "./context";

export const frequencyData = new Float32Array(analyserNode.frequencyBinCount);
export const timeDomainData = new Float32Array(analyserNode.frequencyBinCount);

export function analyze() {
  analyserNode.getFloatFrequencyData(frequencyData);
  analyserNode.getFloatTimeDomainData(timeDomainData);
}

function getFFTBinForFreq(freq: number) {
  const max = analyserNode.frequencyBinCount - 1;
  const bin = Math.round(
    (freq * analyserNode.fftSize) / audioContext.sampleRate,
  );
  return Math.min(bin, max);
}

/**
 * @returns Normalized value between 0 and 1
 */
function normalizeDB(dB: number) {
  const minValue = analyserNode.minDecibels;
  const maxValue = analyserNode.maxDecibels;

  return constrainNumber((dB - minValue) / (maxValue - minValue), 0, 1);
}

/**
 * @returns Energy value for the given frequency range between 0 and 1
 */
export function getEnergyForFreqs(minFrequency: number, maxFrequency: number) {
  const startBin = getFFTBinForFreq(minFrequency);
  const endBin = getFFTBinForFreq(maxFrequency);

  let energy = 0;
  for (let i = startBin; i <= endBin; i++) {
    const dB = frequencyData[i]!;
    energy += normalizeDB(dB);
  }

  return energy / (endBin - startBin + 1);
}
