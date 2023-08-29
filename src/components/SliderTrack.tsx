import { CSSProperties } from "react";
import {
  SliderTrack as RacSliderTrack,
  SliderThumb,
} from "react-aria-components";

const SliderTrack = () => {
  return (
    <RacSliderTrack className="group relative h-3 w-full rounded before:absolute before:top-1/2 before:h-1 before:w-full before:-translate-y-1/2 before:rounded before:bg-gray-600">
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
    </RacSliderTrack>
  );
};

export default SliderTrack;
