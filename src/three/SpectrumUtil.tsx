// Taken from https://github.com/tariqksoliman/Vissonance/blob/master/scripts/Spectrum.js
/**
 * MIT License

Copyright (c) 2020 Tariq Soliman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

export class Spectrum {
  spectrumMaxExponent = 5;
  spectrumMinExponent = 3;

  spectrumHeight = 255;

  GetVisualBins(
    dataArray: Uint8Array,
    numElements: number,
    SpectrumStart: number,
    SpectrumEnd: number,
  ) {
    const SpectrumBarCount = numElements;
    const SamplePoints = [];
    const NewArray = [];
    let LastSpot = 0;
    for (let i = 0; i < SpectrumBarCount; i++) {
      let Bin = Math.round(
        this.SpectrumEase(i / SpectrumBarCount) *
          (SpectrumEnd - SpectrumStart) +
          SpectrumStart,
      );
      if (Bin <= LastSpot) {
        Bin = LastSpot + 1;
      }
      LastSpot = Bin;
      SamplePoints[i] = Bin;
    }

    const MaxSamplePoints = [];
    for (let i = 0; i < SpectrumBarCount; i++) {
      const CurSpot = SamplePoints[i]!;
      let NextSpot = SamplePoints[i + 1];
      if (NextSpot == null) {
        NextSpot = SpectrumEnd;
      }

      let CurMax = dataArray[CurSpot]!;
      let MaxSpot = CurSpot;
      const Dif = NextSpot - CurSpot;
      for (let j = 1; j < Dif; j++) {
        const NewSpot = CurSpot + j;
        if (dataArray[NewSpot]! > CurMax) {
          CurMax = dataArray[NewSpot]!;
          MaxSpot = NewSpot;
        }
      }
      MaxSamplePoints[i] = MaxSpot;
    }

    for (let i = 0; i < SpectrumBarCount; i++) {
      const NextMaxSpot = MaxSamplePoints[i]!;
      let LastMaxSpot = MaxSamplePoints[i - 1];
      if (LastMaxSpot == null) {
        LastMaxSpot = SpectrumStart;
      }
      const LastMax = dataArray[LastMaxSpot]!;
      const NextMax = dataArray[NextMaxSpot]!;

      NewArray[i] = (LastMax + NextMax) / 2;
      if (isNaN(NewArray[i]!)) {
        NewArray[i] = 0;
      }
    }
    return this.exponentialTransform(NewArray);
  }

  exponentialTransform(array: number[]) {
    const newArr = [];
    for (let i = 0; i < array.length; i++) {
      const exp =
        this.spectrumMaxExponent +
        (this.spectrumMinExponent - this.spectrumMaxExponent) *
          (i / array.length);
      newArr[i] = Math.max(
        Math.pow(array[i]! / this.spectrumHeight, exp) * this.spectrumHeight,
        1,
      );
    }
    return newArr;
  }

  SpectrumEase(v: number) {
    return Math.pow(v, 2.55);
  }
}
