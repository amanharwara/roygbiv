/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * A JS FIFO implementation for the AudioWorklet. 3 assumptions for the
 * simpler operation:
 *  1. the push and the pull operation are done by 128 frames. (Web Audio
 *    API's render quantum size in the speficiation)
 *  2. the channel count of input/output cannot be changed dynamically.
 *    The AudioWorkletNode should be configured with the `.channelCount = k`
 *    (where k is the channel count you want) and
 *    `.channelCountMode = explicit`.
 *  3. This is for the single-thread operation. (obviously)
 */
export class RingBuffer {
  private readIndex = 0;
  private writeIndex = 0;
  private _framesAvailable = 0;
  private channelData: Float32Array[] = [];

  /**
   * @constructor
   * @param length Buffer length in frames.
   * @param channelCount Buffer channel count.
   */
  constructor(
    /** Buffer length in frames */
    private length: number,
    /** Buffer channel count */
    private channelCount: number,
  ) {
    for (let i = 0; i < this.channelCount; ++i) {
      this.channelData[i] = new Float32Array(this.length);
    }
  }

  /**
   * @return Available frames in buffer.
   */
  get framesAvailable(): number {
    return this._framesAvailable;
  }

  /**
   * Push a sequence of Float32Arrays to buffer.
   */
  push(arraySequence: Float32Array[]) {
    // The channel count of arraySequence and the length of each channel must
    // match with this buffer obejct.

    // Transfer data from the |arraySequence| storage to the internal buffer.
    const sourceLength = arraySequence[0] ? arraySequence[0].length : 0;
    for (let i = 0; i < sourceLength; ++i) {
      const writeIndex = (this.writeIndex + i) % this.length;
      for (let channel = 0; channel < this.channelCount; ++channel) {
        const array = arraySequence[channel];
        const value = array?.[i];
        const channelData = this.channelData[channel];
        if (
          array === undefined ||
          channelData === undefined ||
          value === undefined
        ) {
          continue;
        }
        channelData[writeIndex] = value;
      }
    }

    this.writeIndex += sourceLength;
    if (this.writeIndex >= this.length) {
      this.writeIndex = 0;
    }

    // For excessive frames, the buffer will be overwritten.
    this._framesAvailable += sourceLength;
    if (this._framesAvailable > this.length) {
      this._framesAvailable = this.length;
    }
  }

  /**
   * Pull data out of buffer and fill a given sequence of Float32Arrays.
   */
  pull(arraySequence: Float32Array[]) {
    // The channel count of arraySequence and the length of each channel must
    // match with this buffer obejct.

    // If the FIFO is completely empty, do nothing.
    if (this._framesAvailable === 0) {
      return;
    }

    if (!arraySequence[0]) {
      return;
    }

    const destinationLength = arraySequence[0].length;

    // Transfer data from the internal buffer to the |arraySequence| storage.
    for (let i = 0; i < destinationLength; ++i) {
      const readIndex = (this.readIndex + i) % this.length;
      for (let channel = 0; channel < this.channelCount; ++channel) {
        const array = arraySequence[channel];
        const channelData = this.channelData[channel];
        const value = channelData?.[readIndex];
        if (
          array === undefined ||
          channelData === undefined ||
          value === undefined
        ) {
          continue;
        }
        array[i] = value;
      }
    }

    this.readIndex += destinationLength;
    if (this.readIndex >= this.length) {
      this.readIndex = 0;
    }

    this._framesAvailable -= destinationLength;
    if (this._framesAvailable < 0) {
      this._framesAvailable = 0;
    }
  }
}
