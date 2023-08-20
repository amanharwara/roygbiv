import { CSSProperties, useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import dayjsObjectSupport from "dayjs/plugin/objectSupport";
import {
  Button,
  Label,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import PlayIcon from "../icons/PlayIcon";
import PauseIcon from "../icons/PauseIcon";
import RewindIcon from "../icons/RewindIcon";
dayjs.extend(dayjsObjectSupport);

const getFormattedDuration = (duration: number) => {
  return dayjs({
    seconds: duration,
  }).format(duration >= 3600 ? "HH:mm:ss" : "mm:ss");
};

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

function PlaybackControls({
  isPlaying,
  audio,
}: {
  isPlaying: boolean;
  audio: HTMLAudioElement;
}) {
  return (
    <div className="flex items-center gap-4">
      <Button
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-700"
        onPress={() => {
          audio.currentTime -= 5;
        }}
      >
        <RewindIcon className="h-4 w-4 text-white" />
      </Button>
      <Button
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white"
        onPress={() => {
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
        }}
      >
        {isPlaying ? (
          <PauseIcon className="h-5 w-5 text-black" />
        ) : (
          <PlayIcon className="h-5 w-5 text-black" />
        )}
      </Button>
      <Button
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-700"
        onPress={() => {
          audio.currentTime += 5;
        }}
      >
        <RewindIcon className="h-4 w-4 rotate-180 text-white" />
      </Button>
    </div>
  );
}

function SelectedAudioFile({ file }: { file: File }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number>();

  const audioSrc = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const audio = useMemo(() => {
    if (!audioSrc) return null;
    const audio = new Audio(audioSrc);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setElapsed(audio.currentTime);
    });
    audio.addEventListener("timeupdate", () => {
      setElapsed(audio.currentTime);
    });
    audio.addEventListener("pause", () => {
      setIsPlaying(false);
    });
    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });
    return audio;
  }, [audioSrc]);

  const setCurrent = useCallback(
    (elapsed: number) => {
      if (!audio) return;
      audio.currentTime = elapsed;
      setElapsed(elapsed);
    },
    [audio],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-grow" />
      <div className="grid grid-cols-3 items-center gap-4 border-t border-gray-500 px-6 py-5">
        <div className="flex-shrink-0">{file.name}</div>
        {audio && (
          <div className="flex w-full max-w-[722px] flex-col items-center gap-1">
            <PlaybackControls isPlaying={isPlaying} audio={audio} />
            <PlaybackProgressBar
              duration={duration}
              current={elapsed}
              onChange={setCurrent}
            />
          </div>
        )}
        <div className="flex-shrink-0" />
      </div>
    </div>
  );
}

export default SelectedAudioFile;
