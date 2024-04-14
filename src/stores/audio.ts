import { create } from "zustand";
import { nanoid } from "nanoid";
import { isAudioPaused, setAudioSrc } from "../audio/context";
import { analyze, frequencyData, getEnergyForFreqs } from "../audio/analyzer";
import { getAudioLevel } from "../audio/amplitude";
import { analyzeTrackData } from "../audio/preprocessing";

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
  name: string;
  min: number;
  max: number;
  value: number;
  gain: number;
};

export const audioStore = create<{
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;

  selectedRange: string | null;
  setSelectedRange: (name: string | null) => void;

  ranges: FrequencyRange[];
  addNewRange: (preset?: PresetFrequencyRange) => string;
  updateRange: (name: string, range: Partial<FrequencyRange>) => void;
  removeRange: (name: string) => void;

  value: number;
  setValue: (value: number) => void;

  level: number;
  setLevel: (level: number) => void;
}>((set, get) => ({
  audioFile: null,
  setAudioFile: (audioFile) => {
    set({ audioFile });
    setAudioSrc(audioFile ? URL.createObjectURL(audioFile) : "");
    if (audioFile) {
      analyzeTrackData(audioFile);
    }
  },

  selectedRange: null,
  setSelectedRange: (selectedRangeId) =>
    set({ selectedRange: selectedRangeId }),

  ranges: [],
  addNewRange: (preset?: PresetFrequencyRange) => {
    const name = preset ? preset : nanoid(5);
    set((state) => ({
      ranges: [
        ...state.ranges,
        {
          name,
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
    return name;
  },
  updateRange: (name: string, range: Partial<FrequencyRange>) => {
    set((state) => ({
      ranges: state.ranges.map((r) =>
        r.name === name ? { ...r, ...range } : r,
      ),
    }));
  },
  removeRange: (name: string) => {
    set((state) => ({
      ranges: state.ranges.filter((r) => r.name !== name),
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

export function getRangeValue(name: string) {
  return audioStore.getState().ranges.find((r) => r.name === name)?.value ?? 0;
}

function update() {
  requestAnimationFrame(update);

  const state = audioStore.getState();
  const ranges = state.ranges;

  if (isAudioPaused()) {
    return;
  }

  analyze();

  const audioLevel = getAudioLevel();
  state.setLevel(audioLevel);

  for (const range of ranges) {
    const value = getEnergyForFreqs(frequencyData, range.min, range.max);
    state.updateRange(range.name, { value });
  }
}

requestAnimationFrame(update);
