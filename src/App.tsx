import AudioFileDropZone from "./components/AudioFileDropZone";
import { useAtom } from "jotai";
import { audioFileAtom } from "./stores/audio";
import {
  Button,
  DialogTrigger,
  Item,
  Menu,
  MenuTrigger,
  Popover,
  TooltipTrigger,
} from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";
import { CanvasSettingsModal, SizedCanvas } from "./components/Canvas";
import { SelectedAudio } from "./components/SelectedAudio";
import {
  createImageLayer,
  layersAtom,
  selectedLayerAtom,
} from "./stores/layers";
import AddIcon from "./icons/AddIcon";
import DeleteIcon from "./icons/DeleteIcon";
import StyledTooltip from "./components/StyledTooltip";
import ImageIcon from "./icons/ImageIcon";
import { useCallback } from "react";
import { readFileAsImage } from "./utils/readFile";

function Layers() {
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const [layers, setLayers] = useAtom(layersAtom);

  const addAndSelectImageLayer = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const image = await readFileAsImage(file);
        const layer = createImageLayer(image);
        setLayers((layers) => [...layers, layer]);
        setSelectedLayer(layer);
      }
    };
    input.click();
  }, [setLayers, setSelectedLayer]);

  return (
    <div className="flex min-h-0 flex-grow flex-col">
      <div className="border-y border-gray-600 px-3 py-2 text-sm font-semibold">
        Layers
      </div>
      <div className="min-h-0 flex-grow"></div>
      <div className="flex items-center gap-2 border-t border-gray-600 px-2 py-1.5">
        <MenuTrigger>
          <TooltipTrigger delay={150} closeDelay={0}>
            <Button className="flex items-center justify-center rounded p-1 hover:bg-gray-600 data-[pressed]:bg-neutral-800">
              <AddIcon className="h-4 w-4" />
            </Button>
            <StyledTooltip offset={4}>Add a new layer</StyledTooltip>
          </TooltipTrigger>
          <Popover
            offset={2}
            className="rounded border border-neutral-700 bg-neutral-800 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out "
          >
            <Menu
              autoFocus="first"
              shouldFocusWrap
              className="max-h-[inherit] min-w-[10rem] select-none overflow-auto p-1 outline-none"
              onAction={(key) => {
                if (key === "add-image") {
                  addAndSelectImageLayer();
                }
              }}
            >
              <Item
                className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none hover:bg-neutral-900 data-[focused]:bg-neutral-900"
                id="add-image"
              >
                <ImageIcon className="h-4 w-4" />
                Add image
              </Item>
            </Menu>
          </Popover>
        </MenuTrigger>
        <TooltipTrigger delay={150} closeDelay={0}>
          <Button className="flex items-center justify-center rounded p-1 hover:bg-gray-600">
            <DeleteIcon className="h-4 w-4" />
          </Button>
          <StyledTooltip offset={4}>Delete selected layer</StyledTooltip>
        </TooltipTrigger>
      </div>
    </div>
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
              <StyledTooltip offset={4}>Change canvas settings</StyledTooltip>
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
      <div className="flex h-full flex-col border-l border-gray-600 [grid-column:2]">
        <div className="min-h-0 flex-grow" />
        <Layers />
      </div>
    </div>
  );
}
