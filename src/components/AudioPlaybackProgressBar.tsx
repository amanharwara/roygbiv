import { CSSProperties } from "react";
import {
  Slider,
  Label,
  SliderOutput,
  SliderTrack,
  SliderThumb,
} from "react-aria-components";
import { getFormattedDuration } from "../utils/getFormattedDuration";

function PlaybackProgressBar({
  duration,
  current,
  onChange,
}: {
  duration: number;
  current: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      className="grid w-full grid-cols-[0.25fr_1fr_0.25fr] items-center justify-items-center gap-1 text-sm"
      maxValue={duration}
      value={current}
      onChange={onChange}
    >
      <Label className="sr-only">Change progress</Label>
      <SliderOutput>
        {({ state }) => <>{getFormattedDuration(state.getThumbValue(0))}</>}
      </SliderOutput>
      <SliderTrack className="group relative h-3 w-full rounded before:absolute before:top-1/2 before:h-1 before:w-full before:-translate-y-1/2 before:rounded before:bg-gray-600">
        {({ state }) => (
          <>
            <div
              role="presentation"
              className="absolute top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded"
            >
              <div
                role="presentation"
                className="absolute top-1/2 h-1 w-full rounded bg-white group-focus-within:bg-green-500 group-hover:bg-green-500"
                style={
                  {
                    "--thumb-position": state.getThumbPercent(0) * 100 + "%",
                    transform:
                      "translate3d(calc(-100% + var(--thumb-position)), -50%, 0)",
                  } as CSSProperties
                }
              />
            </div>
            <SliderThumb className="top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 group-hover:opacity-100 data-[focus-visible]:opacity-100" />
          </>
        )}
      </SliderTrack>
      <div>{getFormattedDuration(duration)}</div>
    </Slider>
  );
}

export default PlaybackProgressBar;
