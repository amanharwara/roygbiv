import { useState } from "react";
import {
  FrequencyRange,
  PresetFrequencyRange,
  PresetFrequencyRanges,
  audio,
  store,
} from "./audio";

function AudioControls() {
  return (
    <>
      <input
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          audio.src = URL.createObjectURL(file);
        }}
      />
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            audio.play();
          }}
        >
          play
        </button>
        <button
          onClick={() => {
            audio.pause();
          }}
        >
          pause
        </button>
        <button
          onClick={() => {
            audio.pause();
            audio.currentTime = 0;
          }}
        >
          reset
        </button>
      </div>
    </>
  );
}

function FrequencyRangeDisplay({ range }: { range: FrequencyRange }) {
  const { updateRange, removeRange } = store();

  return (
    <div className="bg-neutral-800 p-2">
      <label className="mb-2 flex items-center gap-4">
        Name:
        <input
          type="text"
          value={range.name}
          onChange={(e) => updateRange(range.id, { name: e.target.value })}
        />
      </label>
      <label className="mb-2 flex items-center gap-4">
        Minimum:
        <input
          type="number"
          value={range.min}
          onChange={(e) =>
            updateRange(range.id, { min: parseInt(e.target.value) })
          }
        />
      </label>
      <label className="mb-2 flex items-center gap-4">
        Maximum:
        <input
          type="number"
          value={range.max}
          onChange={(e) =>
            updateRange(range.id, { max: parseInt(e.target.value) })
          }
        />
      </label>
      <label className="mb-2 flex items-center gap-4">
        Gain:
        <input
          type="number"
          value={range.gain}
          onChange={(e) =>
            updateRange(range.id, { gain: parseFloat(e.target.value) })
          }
          step={0.1}
        />
      </label>
      <div className="mb-2 flex items-center gap-2">
        <progress value={range.value} max={255} />
        {range.value}
      </div>
      <div>
        <button onClick={() => removeRange(range.id)}>remove range</button>
      </div>
    </div>
  );
}

export default function App() {
  const { ranges, addNewRange } = store();
  const [selectedPreset, setSelectedPreset] =
    useState<PresetFrequencyRange>("mid");

  return (
    <div className="flex flex-wrap gap-4 p-8 text-base">
      <div className="flex flex-col gap-4">
        <AudioControls />
        <div className="flex items-center gap-4">
          <select
            value={selectedPreset}
            onChange={(e) =>
              setSelectedPreset(e.target.value as PresetFrequencyRange)
            }
          >
            {Object.entries(PresetFrequencyRanges).map(([name]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={() => addNewRange(selectedPreset)}>
            Add new range
          </button>
        </div>
      </div>
      {ranges.map((range) => (
        <FrequencyRangeDisplay key={range.id} range={range} />
      ))}
    </div>
  );
}
