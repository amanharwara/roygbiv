import { create } from "zustand";
import { nanoid } from "nanoid";

export const audioContext = new AudioContext();
const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 8192;
analyserNode.connect(audioContext.destination);
analyserNode.smoothingTimeConstant = 0.5;

export const audio = new Audio();

const sourceNode = audioContext.createMediaElementSource(audio);
sourceNode.connect(analyserNode);

const audioData = new Uint8Array(analyserNode.frequencyBinCount);

export const PresetFrequencyRanges = {
  bass: {
    min: 20,
    max: 140,
  },
  lowMid: {
    min: 140,
    max: 400,
  },
  mid: {
    min: 400,
    max: 2600,
  },
  highMid: {
    min: 2600,
    max: 5200,
  },
  treble: {
    min: 5200,
    max: 14000,
  },
};

export type PresetFrequencyRange = keyof typeof PresetFrequencyRanges;

export type FrequencyRange = {
  id: string;
  name: string;
  min: number;
  max: number;
  value: number;
  gain: number;
};

export const store = create<{
  ranges: FrequencyRange[];
  addNewRange: (preset?: PresetFrequencyRange) => void;
  updateRange: (id: string, range: Partial<FrequencyRange>) => void;
  removeRange: (id: string) => void;

  value: number;
  setValue: (value: number) => void;
}>((set) => ({
  ranges: [],
  addNewRange: (preset?: PresetFrequencyRange) => {
    const id = nanoid();
    set((state) => ({
      ranges: [
        ...state.ranges,
        {
          id,
          name: preset ?? "mid",
          min: preset
            ? PresetFrequencyRanges[preset].min
            : PresetFrequencyRanges.mid.min,
          max: preset
            ? PresetFrequencyRanges[preset].max
            : PresetFrequencyRanges.mid.max,
          value: 0,
          gain: 1,
        },
      ],
    }));
  },
  updateRange: (id: string, range: Partial<FrequencyRange>) => {
    set((state) => ({
      ranges: state.ranges.map((r) => (r.id === id ? { ...r, ...range } : r)),
    }));
  },
  removeRange: (id: string) => {
    set((state) => ({
      ranges: state.ranges.filter((r) => r.id !== id),
    }));
  },

  value: 0,
  setValue: (value) => set({ value }),
}));

function getEnergy(minFrequency: number, maxFrequency: number, gain = 1) {
  const nyquist = audioContext.sampleRate / 2;

  const lowIndex = Math.round((minFrequency / nyquist) * audioData.length);
  const highIndex = Math.round((maxFrequency / nyquist) * audioData.length);

  let total = 0;
  let numberOfFrequencies = 0;
  for (let i = lowIndex; i <= highIndex; i++) {
    total += audioData[i]!;
    numberOfFrequencies++;
  }

  return (total / numberOfFrequencies) * gain;
}

function update() {
  requestAnimationFrame(update);

  const ranges = store.getState().ranges;

  if (audio.paused) {
    for (const range of ranges) {
      store.getState().updateRange(range.id, { value: 0 });
    }
    return;
  }

  analyserNode.getByteFrequencyData(audioData);

  for (const range of ranges) {
    const value = Math.floor(getEnergy(range.min, range.max, range.gain));
    store.getState().updateRange(range.id, { value });
  }
}

requestAnimationFrame(update);
