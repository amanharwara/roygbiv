import { useEffect, useRef, useState } from "react";
import { audioStore } from "../../audio/store";
import NumberField from "../ui/NumberField";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { audioContext, analyserNode, sourceNode } from "../../audio/context";

const SelectedFrequencyRangeOptions = () => {
  const selectedRangeID = audioStore((state) => state.selectedRange);
  const ranges = audioStore((state) => state.ranges);
  const range = ranges.find((range) => range.name === selectedRangeID);

  const [analyzerContainer, setAnalyzerContainer] =
    useState<HTMLDivElement | null>(null);
  const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);
  useEffect(() => {
    if (!analyzerContainer) {
      return;
    }

    const audioMotion = new AudioMotionAnalyzer(analyzerContainer, {
      audioCtx: audioContext,
      source: sourceNode,
      fftSize: analyserNode.fftSize,
      smoothing: analyserNode.smoothingTimeConstant,
      minDecibels: analyserNode.minDecibels,
      maxDecibels: analyserNode.maxDecibels,
      showScaleY: true,
      gradient: "steelblue",
    });
    audioMotionRef.current = audioMotion;

    return () => {
      audioMotion.destroy();
      audioMotionRef.current = null;
    };
  }, [analyzerContainer]);

  useEffect(() => {
    const analyzer = audioMotionRef.current;
    if (!analyzer) {
      return;
    }
    if (!range) {
      return;
    }

    analyzer.setFreqRange(range.min, range.max);
  }, [range]);

  if (!range) {
    return (
      <div className="mx-auto my-auto flex text-sm text-neutral-400">
        No range selected
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap border-b border-neutral-600 px-3 py-2 text-sm font-semibold">
        {range.name}
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden py-3">
        <div className="px-3 text-sm">
          <NumberField
            label="Minimum Frequency:"
            minValue={0}
            value={range.min}
            maxValue={range.max}
            name="min"
            groupClassName="w-full"
            onChange={(min) => {
              audioStore.getState().updateRange(range.name, { min });
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Maximum Frequency:"
            minValue={range.min}
            value={range.max}
            maxValue={20000}
            name="max"
            groupClassName="w-full"
            onChange={(max) => {
              audioStore.getState().updateRange(range.name, { max });
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Gain:"
            minValue={0}
            value={range.gain}
            maxValue={2}
            step={0.1}
            name="gain"
            groupClassName="w-full"
            onChange={(gain) => {
              audioStore.getState().updateRange(range.name, { gain });
            }}
          />
        </div>
        <div className="px-3 text-sm">Value: {range.value}</div>
        <div className="my-3 mt-auto h-40" ref={setAnalyzerContainer} />
      </div>
    </>
  );
};

export default SelectedFrequencyRangeOptions;
