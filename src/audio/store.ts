import { create } from "zustand";
import { nanoid } from "nanoid";
import { isAudioPaused } from "./context";
import { analyze, getEnergyForFreqs } from "./analyzer";
import { getAudioLevel } from "./amplitude";

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
  addNewRange: (preset?: PresetFrequencyRange) => string;
  updateRange: (id: string, range: Partial<FrequencyRange>) => void;
  removeRange: (id: string) => void;

  value: number;
  setValue: (value: number) => void;

  level: number;
  setLevel: (level: number) => void;
}>((set, get) => ({
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
    return id;
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

  level: 0,
  setLevel: (level: number) => {
    if (get().level !== level) {
      set({ level });
    }
  },
}));

function update() {
  requestAnimationFrame(update);

  const ranges = store.getState().ranges;

  if (isAudioPaused()) {
    return;
  }

  analyze();

  store.getState().setLevel(getAudioLevel());

  for (const range of ranges) {
    const value = Math.floor(getEnergyForFreqs(range.min, range.max));
    store.getState().updateRange(range.id, { value });
  }
}

requestAnimationFrame(update);
