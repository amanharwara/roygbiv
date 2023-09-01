import { Slider, Label, SliderOutput } from "react-aria-components";
import { getFormattedDuration } from "../utils/getFormattedDuration";
import SingleThumbSliderTrack from "./SliderTrack";

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
      <SingleThumbSliderTrack />
      <div>{getFormattedDuration(duration)}</div>
    </Slider>
  );
}

export default PlaybackProgressBar;
