import { RingBuffer } from "./RingBuffer";

class AmplitudeProcessor extends AudioWorkletProcessor {
  stereoVolume = [0, 0];
  maxVolume = 0.001;
  bufferSize = 2048;
  numberOfInputChannels = 2;
  smoothing = 0;
  inputRingBuffer = new RingBuffer(this.bufferSize, this.numberOfInputChannels);
  outputRingBuffer = new RingBuffer(this.bufferSize, 1);
  inputRingBufferArraySequence = new Array(this.numberOfInputChannels)
    .fill(null)
    .map(() => new Float32Array(this.bufferSize));

  constructor() {
    super();
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0];
    const output = outputs[0];
    const smoothing = this.smoothing;

    if (!input || !output) {
      return false;
    }

    this.inputRingBuffer.push(input);

    if (this.inputRingBuffer.framesAvailable >= this.bufferSize) {
      this.inputRingBuffer.pull(this.inputRingBufferArraySequence);

      for (let channel = 0; channel < this.numberOfInputChannels; ++channel) {
        const inputBuffer = this.inputRingBufferArraySequence[channel];
        if (!inputBuffer) {
          continue;
        }

        const bufLength = inputBuffer.length;

        let sum = 0;
        for (let i = 0; i < bufLength; i++) {
          const x = inputBuffer[i]!;
          sum += x * x;
        }

        // ... then take the square root of the sum.
        const rms = Math.sqrt(sum / bufLength);

        this.stereoVolume[channel] = Math.max(
          rms,
          this.stereoVolume[channel]! * smoothing,
        );
        this.maxVolume = Math.max(this.stereoVolume[channel]!, this.maxVolume);
      }

      // calculate stero normalized volume and add volume from all channels together
      let volSum = 0;
      for (let index = 0; index < this.stereoVolume.length; index++) {
        volSum += this.stereoVolume[index]!;
      }

      // volume is average of channels
      const volume = volSum / this.stereoVolume.length;

      // normalized value
      const volNorm = Math.max(Math.min(volume / this.maxVolume, 1), 0);

      this.port.postMessage({
        name: "amplitude",
        volume: volume,
        volNorm: volNorm,
        stereoVol: this.stereoVolume,
      });

      // pass input through to output
      this.outputRingBuffer.push(this.inputRingBufferArraySequence);
    }

    // pull 128 frames out of the ring buffer
    // if the ring buffer does not have enough frames, the output will be silent
    this.outputRingBuffer.pull(output);

    return true;
  }
}

registerProcessor("amplitude-processor", AmplitudeProcessor);
