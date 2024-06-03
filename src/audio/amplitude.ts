import amplitudeProcessor from "./amplitudeProcessor.ts?url";
import { audioContext, sourceNode } from "./context";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let volume = 0;
let volumeNormalized = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let stereoVolume = [0, 0];
let stereoVolumeNormalized = [0, 0];

audioContext.audioWorklet.addModule(amplitudeProcessor).then(() => {
  const workletNode = new AudioWorkletNode(audioContext, "amplitude-processor");

  const output = audioContext.createGain();
  workletNode.connect(output);
  output.connect(audioContext.destination);
  sourceNode.connect(workletNode);

  workletNode.port.onmessage = (event) => {
    if (event.data.name === "amplitude") {
      volume = event.data.volume;
      volumeNormalized = event.data.volNorm;
      stereoVolume = event.data.stereoVol;
      stereoVolumeNormalized = event.data.stereoVolNorm;
    }
  };
});

export enum Channel {
  Left = 0,
  Right = 1,
}

/**
 * @returns Normalized audio level from 0 to 1.
 */
export function getAudioLevel(channel?: Channel): number {
  if (typeof channel !== "undefined") {
    return stereoVolumeNormalized[channel]!;
  } else {
    return volumeNormalized;
  }
}
