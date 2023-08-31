import { Button, Slider, Label } from "react-aria-components";
import VolumeIcon from "../icons/VolumeIcon";
import VolumeOffIcon from "../icons/VolumeOffIcon";
import { useAudioStore } from "../stores/audio";
import SliderTrack from "./SliderTrack";
import { useRef, useCallback } from "react";

const AudioVolumeControls = () => {
  const audio = useAudioStore((state) => state.audio);
  const volume = useAudioStore((state) => state.volume);
  const prevVolume = useRef(volume);
  const isMuted = volume === 0;

  const toggleMute = useCallback(() => {
    if (isMuted) {
      audio.volume = prevVolume.current;
    } else {
      prevVolume.current = audio.volume;
      audio.volume = 0;
    }
  }, [audio, isMuted]);

  return (
    <>
      <Button
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-700"
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
        <SliderTrack />
      </Slider>
    </>
  );
};

export default AudioVolumeControls;
