import { analyserNode, audioContext } from "./context";

export const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
export const timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);

export function analyze() {
  analyserNode.getByteFrequencyData(frequencyData);
  analyserNode.getByteTimeDomainData(timeDomainData);
}

export function getEnergyForFreqs(minFrequency: number, maxFrequency: number) {
  const nyquist = audioContext.sampleRate / 2;

  if (minFrequency > maxFrequency) {
    const swap = minFrequency;
    minFrequency = maxFrequency;
    maxFrequency = swap;
  }

  const lowIndex = Math.round((minFrequency / nyquist) * frequencyData.length);
  const highIndex = Math.round((maxFrequency / nyquist) * frequencyData.length);

  let total = 0;
  let numberOfFrequencies = 0;

  for (let i = lowIndex; i <= highIndex; i++) {
    total += frequencyData[i]!;
    numberOfFrequencies += 1;
  }

  return total / numberOfFrequencies;
}
