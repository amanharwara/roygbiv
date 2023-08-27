import AudioFileDropZone from "./components/AudioFileDropZone";
import { atom, useAtom, useAtomValue } from "jotai";
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
import { Canvas } from "@react-three/fiber";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  Modal,
  ModalOverlay,
  NumberField,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";

function SelectedAudio({ file }: { file: File }) {
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

const canvasSizeAtom = atom({
  width: 1280,
  height: 720,
});

function SizedCanvas() {
  const { width, height } = useAtomValue(canvasSizeAtom);

  return (
    <div
      className="bg-black"
      style={{
        width,
        height,
      }}
    >
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
    </div>
  );
}

function CanvasSettingsModal() {
  const [{ width, height }, setSize] = useAtom(canvasSizeAtom);

  const saveSettings = useCallback(
    (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      const formData = new FormData(event.currentTarget);
      const width = Number(formData.get("width"));
      const height = Number(formData.get("height"));
      setSize({
        width,
        height,
      });
      close();
    },
    [setSize],
  );

  return (
    <ModalOverlay
      className="data-[entering]:animate-fade-in data-[exiting]:animate-fade-out fixed inset-0 flex items-center justify-center bg-black/50"
      isDismissable
    >
      <Modal className="max-w-[50vw] rounded bg-gray-800 p-6" isDismissable>
        <Dialog className="outline-none">
          {({ close }) => (
            <form
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveSettings(event, close);
                }
              }}
              onSubmit={(event) => {
                event.preventDefault();
                saveSettings(event, close);
              }}
            >
              <div className="flex flex-col gap-4">
                <NumberField
                  className="group flex flex-col gap-1"
                  defaultValue={width}
                  name="width"
                >
                  <Label>Width:</Label>
                  <Input className="rounded border border-transparent bg-gray-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-slate-950" />
                </NumberField>
                <NumberField
                  className="group flex flex-col gap-1"
                  defaultValue={height}
                  name="height"
                >
                  <Label>Height:</Label>
                  <Input className="rounded border border-transparent bg-gray-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-slate-950" />
                </NumberField>
                <Button
                  className="rounded bg-gray-700 px-2 py-1.5 text-sm hover:bg-gray-900"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

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
