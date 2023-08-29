import { Button } from "react-aria-components";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import RewindIcon from "../icons/RewindIcon";

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
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-700"
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
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-700"
        onPress={() => {
          audio.currentTime += 5;
        }}
      >
        <RewindIcon className="h-4 w-4 rotate-180 text-white" />
      </Button>
    </div>
  );
}

export default PlaybackControls;
