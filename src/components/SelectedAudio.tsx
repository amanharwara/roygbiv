import { useAtomValue, useSetAtom } from "jotai";
import {
  audio,
  audioDurationAtom,
  audioElapsedAtom,
  audioFileAtom,
  isAudioPlayingAtom,
} from "../stores/audio";
import PlaybackControls from "./AudioPlaybackControls";
import PlaybackProgressBar from "./AudioPlaybackProgressBar";
import { useCallback } from "react";
import { Button } from "react-aria-components";
import DeleteIcon from "../icons/DeleteIcon";
import AudioVolumeControls from "./AudioVolumeControls";

export function SelectedAudio({ file }: { file: File }) {
  const setAudioFile = useSetAtom(audioFileAtom);
  const isPlaying = useAtomValue(isAudioPlayingAtom);
  const duration = useAtomValue(audioDurationAtom);
  const elapsed = useAtomValue(audioElapsedAtom);

  const setElapsed = useCallback((elapsed: number) => {
    audio.currentTime = elapsed;
  }, []);

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
        <AudioVolumeControls />
      </div>
    </div>
  );
}
