import AudioFileDropZone from "./components/AudioFileDropZone";
import { useAtom, useAtomValue } from "jotai";
import {
  audio,
  audioDurationAtom,
  audioElapsedAtom,
  audioFileAtom,
  isAudioPlayingAtom,
} from "./audio";
import PlaybackControls from "./components/AudioPlaybackControls";
import PlaybackProgressBar from "./components/AudioPlaybackProgressBar";
import { useCallback } from "react";

function SelectedAudio({ file }: { file: File }) {
  const isPlaying = useAtomValue(isAudioPlayingAtom);
  const duration = useAtomValue(audioDurationAtom);
  const elapsed = useAtomValue(audioElapsedAtom);

  const setElapsed = useCallback((elapsed: number) => {
    audio.currentTime = elapsed;
  }, []);

  return (
    <div className="grid grid-cols-3 items-center gap-4 border-t border-gray-500 px-6 py-5">
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

export default function App() {
  const [audioFile, setAudioFile] = useAtom(audioFileAtom);

  return (
    <div className="flex h-full">
      <div className="flex flex-grow flex-col">
        <div className="min-h-0 flex-grow"></div>
        <div className="border-t border-gray-600 [grid-column:1] [grid-row:2]">
          {audioFile ? (
            <SelectedAudio file={audioFile} />
          ) : (
            <AudioFileDropZone setAudioFile={setAudioFile} />
          )}
        </div>
      </div>
      <div className="border-l border-gray-600 [grid-column:2] [grid-row:1/3]"></div>
    </div>
  );
}
