import AudioFileDropZone from "./components/audio/AudioFileDropZone";
import { useAudioStore } from "./stores/audio";
import { Button, DialogTrigger, TooltipTrigger } from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";
import { CanvasSettingsModal, SizedCanvas } from "./components/Canvas";
import { SelectedAudio } from "./components/audio/SelectedAudio";
import Tooltip from "./components/ui/Tooltip";
import LayersList from "./components/layers/LayersList";
import SelectedLayerProperties from "./components/layers/SelectedLayerProperties";

export default function App() {
  const audioFile = useAudioStore((state) => state.audioFile);
  const setAudioFile = useAudioStore((state) => state.setAudioFile);

  return (
    <div className="grid h-full grid-cols-[5fr,1fr] overflow-hidden">
      <div className="flex flex-grow flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-grow items-center justify-center overflow-hidden">
          <div className="h-full w-full overflow-auto p-8">
            <SizedCanvas />
          </div>
          <DialogTrigger>
            <TooltipTrigger delay={150} closeDelay={0}>
              <Button className="absolute right-6 top-6 rounded bg-neutral-700 p-1.5 hover:bg-neutral-800">
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Tooltip offset={4}>Change canvas settings</Tooltip>
            </TooltipTrigger>
            <CanvasSettingsModal />
          </DialogTrigger>
        </div>
        <div className="flex-shrink-0 border-t border-neutral-600">
          {audioFile ? (
            <SelectedAudio file={audioFile} />
          ) : (
            <AudioFileDropZone setAudioFile={setAudioFile} />
          )}
        </div>
      </div>
      <div className="grid h-full grid-rows-[60%_40%] overflow-hidden border-l border-neutral-600 [grid-column:2]">
        <div className="flex flex-col overflow-hidden">
          <SelectedLayerProperties />
        </div>
        <LayersList />
      </div>
    </div>
  );
}
