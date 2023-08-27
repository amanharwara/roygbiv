import { useAtomValue } from "jotai";
import {
  audio,
  audioDurationAtom,
  audioElapsedAtom,
  isAudioPlayingAtom,
} from "../audio";
import PlaybackControls from "./AudioPlaybackControls";
import PlaybackProgressBar from "./AudioPlaybackProgressBar";
import { useCallback } from "react";

export function SelectedAudio({ file }: { file: File }) {
  const isPlaying = useAtomValue(isAudioPlayingAtom);
  const duration = useAtomValue(audioDurationAtom);
  const elapsed = useAtomValue(audioElapsedAtom);

  const setElapsed = useCallback((elapsed: number) => {
    audio.currentTime = elapsed;
  }, []);

  return (
    <div className="grid grid-cols-3 items-center gap-4 p-8">
      <div className="flex-shrink-0">{file.name}</div>
      <div className="flex w-full max-w-[722px] flex-col items-center gap-1">
        <PlaybackControls isPlaying={isPlaying} audio={audio} />
        <PlaybackProgressBar
          duration={duration}
          current={elapsed}
          onChange={setElapsed}
        />
      </div>
      <div className="flex-shrink-0" />
    </div>
  );
}
