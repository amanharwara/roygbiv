import AudioFileDropZone from "./components/AudioFileDropZone";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { audioFileAtom } from "./stores/audio";
import {
  Button,
  DialogTrigger,
  Item,
  ListBox,
  Menu,
  MenuTrigger,
  Popover,
  TooltipTrigger,
} from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";
import { CanvasSettingsModal, SizedCanvas } from "./components/Canvas";
import { SelectedAudio } from "./components/SelectedAudio";
import {
  ImageLayer,
  createImageLayer,
  layersAtom,
  selectedLayerAtom,
} from "./stores/layers";
import AddIcon from "./icons/AddIcon";
import DeleteIcon from "./icons/DeleteIcon";
import Tooltip from "./components/Tooltip";
import ImageIcon from "./icons/ImageIcon";
import { useCallback } from "react";
import { readFileAsImage } from "./utils/readFile";

function LayerListItem({
  layerAtom,
}: {
  layerAtom: PrimitiveAtom<ImageLayer>;
}) {
  const layer = useAtomValue(layerAtom);

  return (
    <Item
      className="px-3 py-1.5 text-sm outline-none aria-selected:bg-gray-700 aria-selected:font-medium"
      id={layerAtom.toString()}
    >
      {layer.name}
    </Item>
  );
}

function SelectedLayer({ atom }: { atom: PrimitiveAtom<ImageLayer> }) {
  const layer = useAtomValue(atom);
  const { name, image } = layer;

  return (
    <>
      <div className="border-b border-gray-600 px-3 py-2 text-sm font-semibold">
        {name}
      </div>
      <div className="flex flex-col">
        <div className="px-3 py-2 text-sm">
          Preview:
          <div className="mt-2 flex items-center justify-center rounded border border-gray-600 p-2">
            <img src={image.src} alt={name} className="max-h-32 max-w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

function Layers() {
  const [selectedLayer, setSelectedLayer] = useAtom(selectedLayerAtom);
  const selectedLayerKey = selectedLayer?.toString();
  const [layers, setLayers] = useAtom(layersAtom);

  const addAndSelectImageLayer = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const image = await readFileAsImage(file);
        const layer = createImageLayer(image, file.name);
        setLayers((layers) => [layer, ...layers]);
        setSelectedLayer(layer);
      }
    };
    input.click();
  }, [setLayers, setSelectedLayer]);

  const deleteSelectedLayer = useCallback(() => {
    if (selectedLayer) {
      setLayers((layers) => {
        const selectedLayerIndex = layers.findIndex(
          (layer) => layer === selectedLayer,
        );
        if (selectedLayerIndex === -1) {
          return layers;
        }
        const newLayers = [...layers];
        newLayers.splice(selectedLayerIndex, 1);
        const previousLayerIndex = Math.max(selectedLayerIndex - 1, 0);
        const previousLayer = newLayers[previousLayerIndex];
        if (previousLayer) {
          setSelectedLayer(previousLayer);
        } else {
          setSelectedLayer(null);
        }
        return newLayers;
      });
    }
  }, [selectedLayer, setLayers, setSelectedLayer]);

  return (
    <div className="flex min-h-0 flex-shrink-0 flex-grow select-none flex-col">
      <div className="border-y border-gray-600 px-3 py-2 text-sm font-semibold">
        Layers
      </div>
      <div className="min-h-0 flex-grow">
        <ListBox
          aria-label="Layers"
          items={layers}
          selectedKeys={selectedLayerKey ? [selectedLayerKey] : []}
          selectionMode="single"
          selectionBehavior="replace"
          onSelectionChange={(keys) => {
            if (keys !== "all") {
              keys.forEach((key) => {
                const layer = layers.find((layer) => layer.toString() === key);
                if (layer) {
                  setSelectedLayer(layer);
                }
              });
            }
          }}
        >
          {layers.map((layer) => (
            <LayerListItem key={layer.toString()} layerAtom={layer} />
          ))}
        </ListBox>
      </div>
      <div className="flex items-center gap-2 border-t border-gray-600 px-2 py-1.5">
        <MenuTrigger>
          <TooltipTrigger delay={150} closeDelay={0}>
            <Button className="flex items-center justify-center rounded p-1 hover:bg-gray-600 data-[pressed]:bg-neutral-800">
              <AddIcon className="h-4 w-4" />
            </Button>
            <Tooltip offset={4}>Add a new layer</Tooltip>
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
          <Button
            onPress={deleteSelectedLayer}
            className="flex items-center justify-center rounded p-1 hover:bg-gray-600 disabled:opacity-70"
            isDisabled={!selectedLayer}
          >
            <DeleteIcon className="h-4 w-4" />
          </Button>
          <Tooltip offset={4}>Delete selected layer</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
}

export default function App() {
  const [audioFile, setAudioFile] = useAtom(audioFileAtom);
  const _selectedLayerAtom = useAtomValue(selectedLayerAtom);

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
              <Tooltip offset={4}>Change canvas settings</Tooltip>
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
        <div className="flex min-h-0 flex-grow flex-col">
          {_selectedLayerAtom ? (
            <SelectedLayer atom={_selectedLayerAtom} />
          ) : (
            <div className="mx-auto my-auto flex text-sm text-gray-400">
              No layer selected
            </div>
          )}
        </div>
        <Layers />
      </div>
    </div>
  );
}
