import AudioFileDropZone from "./components/AudioFileDropZone";
import { useAtom } from "jotai";
import { audioFileAtom } from "./audio";
import {
  Button,
  DialogTrigger,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";
import { CanvasSettingsModal, SizedCanvas } from "./components/Canvas";
import { SelectedAudio } from "./components/SelectedAudio";

export default function App() {
  const [audioFile, setAudioFile] = useAtom(audioFileAtom);

  return (
    <div className="grid h-full grid-cols-[5fr,1fr] overflow-hidden">
      <div className="flex flex-grow flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-grow items-center justify-center overflow-hidden">
          <div className="h-full w-full overflow-auto p-8">
            <SizedCanvas />
          </div>
          <DialogTrigger>
            <TooltipTrigger delay={150} closeDelay={0}>
              <Button className="absolute right-6 top-6 rounded bg-gray-700 p-1.5 hover:bg-gray-800">
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Tooltip
                offset={4}
                className="data-[entering]:animate-fade-in data-[exiting]:animate-fade-out rounded bg-gray-700 px-2.5 py-1.5 text-sm transition-opacity duration-75"
              >
                Change canvas settings
              </Tooltip>
            </TooltipTrigger>
            <CanvasSettingsModal />
          </DialogTrigger>
        </div>
        <div className="flex-shrink-0 border-t border-gray-600">
          {audioFile ? (
            <SelectedAudio file={audioFile} />
          ) : (
            <AudioFileDropZone setAudioFile={setAudioFile} />
          )}
        </div>
      </div>
      <div className="h-full border-l border-gray-600 [grid-column:2]"></div>
    </div>
  );
}
