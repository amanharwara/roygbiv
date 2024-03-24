import { create } from "zustand";
import { nanoid } from "nanoid";
import { isAudioPaused, setAudioSrc } from "./context";
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
  id: number;
  name: string;
  min: number;
  max: number;
  value: number;
  gain: number;
};

export const audioStore = create<{
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;

  selectedRangeId: number | null;
  setSelectedRangeId: (id: number | null) => void;

  ranges: FrequencyRange[];
  addNewRange: (preset?: PresetFrequencyRange) => number;
  updateRange: (id: number, range: Partial<FrequencyRange>) => void;
  removeRange: (id: number) => void;

  value: number;
  setValue: (value: number) => void;

  level: number;
  setLevel: (level: number) => void;
}>((set, get) => ({
  audioFile: null,
  setAudioFile: (audioFile) => {
    set({ audioFile });
    setAudioSrc(audioFile ? URL.createObjectURL(audioFile) : "");
  },

  selectedRangeId: null,
  setSelectedRangeId: (selectedRangeId) => set({ selectedRangeId }),

  ranges: [],
  addNewRange: (preset?: PresetFrequencyRange) => {
    const id = get().ranges.length;
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
  updateRange: (id: number, range: Partial<FrequencyRange>) => {
    set((state) => ({
      ranges: state.ranges.map((r) => (r.id === id ? { ...r, ...range } : r)),
    }));
  },
  removeRange: (id: number) => {
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

export function getRangeValue(id: number) {
  return audioStore.getState().ranges.find((r) => r.id === id)?.value ?? 0;
}

function update() {
  requestAnimationFrame(update);

  const ranges = audioStore.getState().ranges;

  if (isAudioPaused()) {
    return;
  }

  analyze();

  const audioLevel = getAudioLevel();
  audioStore.getState().setLevel(audioLevel);

  for (const range of ranges) {
    const value = Math.floor(getEnergyForFreqs(range.min, range.max));
    audioStore.getState().updateRange(range.id, { value });
  }
}

requestAnimationFrame(update);
