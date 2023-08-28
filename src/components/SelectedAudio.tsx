import { useAtomValue, useSetAtom } from "jotai";
import {
  audio,
  audioDurationAtom,
  audioElapsedAtom,
  audioFileAtom,
  audioVolumeAtom,
  isAudioPlayingAtom,
} from "../stores/audio";
import PlaybackControls from "./AudioPlaybackControls";
import PlaybackProgressBar from "./AudioPlaybackProgressBar";
import { useCallback, useRef } from "react";
import { Button, Label, Slider } from "react-aria-components";
import DeleteIcon from "../icons/DeleteIcon";
import VolumeIcon from "../icons/VolumeIcon";
import VolumeOffIcon from "../icons/VolumeOffIcon";
import StyledSliderTrack from "./StyledSliderTrack";

export function SelectedAudio({ file }: { file: File }) {
  const setAudioFile = useSetAtom(audioFileAtom);
  const isPlaying = useAtomValue(isAudioPlayingAtom);
  const duration = useAtomValue(audioDurationAtom);
  const elapsed = useAtomValue(audioElapsedAtom);
  const volume = useAtomValue(audioVolumeAtom);
  const prevVolume = useRef(volume);
  const isMuted = volume === 0;

  const setElapsed = useCallback((elapsed: number) => {
    audio.currentTime = elapsed;
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      audio.volume = prevVolume.current;
    } else {
      prevVolume.current = audio.volume;
      audio.volume = 0;
    }
  }, [isMuted]);

  return (
    <div className="grid grid-cols-3 items-center gap-4 p-8">
      <div className="flex flex-shrink-0 flex-col items-start gap-2">
        <div>{file.name}</div>
        <Button
          className="flex items-center gap-1 rounded border border-gray-600 px-2 py-1.5 text-sm hover:bg-white hover:text-black"
          onPress={() => {
            setAudioFile(null);
          }}
        >
          <DeleteIcon className="h-4 w-4" />
          Remove audio
        </Button>
      </div>
      <div className="flex w-full max-w-[722px] flex-col items-center gap-1">
        <PlaybackControls isPlaying={isPlaying} audio={audio} />
        <PlaybackProgressBar
          duration={duration}
          current={elapsed}
          onChange={setElapsed}
        />
      </div>
      <div className="flex items-center gap-3 justify-self-end">
        <Button
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-700"
          onPress={toggleMute}
        >
          {isMuted ? (
            <VolumeOffIcon className="h-6 w-6 text-white" />
          ) : (
            <VolumeIcon className="h-6 w-6 text-white" />
          )}
        </Button>
        <Slider
          className="min-w-[100px]"
          value={volume}
          step={0.01}
          maxValue={1}
          onChange={(value) => {
            audio.volume = value;
          }}
        >
          <Label className="sr-only">Change volume</Label>
          <StyledSliderTrack />
        </Slider>
      </div>
    </div>
  );
}
