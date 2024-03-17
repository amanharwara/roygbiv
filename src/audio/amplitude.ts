// @ts-ignore
import amplitudeProcessor from "./amplitudeProcessor.ts?url";
import { audioContext, sourceNode } from "./context";

let volume = 0;
let stereoVolume = [0, 0];

audioContext.audioWorklet.addModule(amplitudeProcessor).then(() => {
  const workletNode = new AudioWorkletNode(audioContext, "amplitude-processor");

  const output = audioContext.createGain();
  workletNode.connect(output);
  output.connect(audioContext.destination);
  sourceNode.connect(workletNode);

  workletNode.port.onmessage = (event) => {
    if (event.data.name === "amplitude") {
      volume = event.data.volume;
      stereoVolume = event.data.stereoVol;
    }
  };
});

export function getAudioLevel(channel?: 0 | 1): number {
  if (typeof channel !== "undefined") {
    return stereoVolume[channel]!;
  } else {
    return volume;
  }
}
