import AudioFileDropZone from "./components/AudioFileDropZone";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { audioFileAtom } from "./stores/audio";
import { Button, DialogTrigger, TooltipTrigger } from "react-aria-components";
import SettingsIcon from "./icons/SettingsIcon";
import { CanvasSettingsModal, SizedCanvas } from "./components/Canvas";
import { SelectedAudio } from "./components/SelectedAudio";
import { ImageLayer, selectedLayerAtom } from "./stores/layers";
import Tooltip from "./components/Tooltip";
import NumberField from "./components/NumberField";
import LayersList from "./components/LayersList";

function SelectedLayer({ atom }: { atom: PrimitiveAtom<ImageLayer> }) {
  const [layer, setLayer] = useAtom(atom);
  const { name, image, width, height, zoom, opacity, x, y } = layer;

  return (
    <>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap border-b border-neutral-600 px-3 py-2 text-sm font-semibold">
        {name}
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden py-3">
        <div className="px-3 text-sm">
          Preview:
          <div className="mt-2 flex items-center justify-center rounded border border-neutral-600 p-2">
            <img src={image.src} alt={name} className="max-h-32 max-w-full" />
          </div>
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Width:"
            defaultValue={image.naturalWidth}
            value={width}
            name="width"
            groupClassName="w-full"
            onChange={(width) => {
              setLayer((layer) => ({
                ...layer,
                width,
              }));
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Height:"
            defaultValue={image.naturalHeight}
            value={height}
            name="height"
            groupClassName="w-full"
            onChange={(height) => {
              setLayer((layer) => ({
                ...layer,
                height,
              }));
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Zoom:"
            defaultValue={1}
            value={zoom}
            name="zoom"
            groupClassName="w-full"
            onChange={(zoom) => {
              setLayer((layer) => ({
                ...layer,
                zoom,
              }));
            }}
            step={0.05}
            formatOptions={{
              style: "percent",
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="Opacity:"
            defaultValue={1}
            maxValue={1}
            value={opacity}
            name="opacity"
            groupClassName="w-full"
            onChange={(opacity) => {
              setLayer((layer) => ({
                ...layer,
                opacity,
              }));
            }}
            step={0.05}
            formatOptions={{
              style: "percent",
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="x:"
            minValue={undefined}
            defaultValue={0}
            value={x}
            name="x"
            groupClassName="w-full"
            onChange={(x) => {
              setLayer((layer) => ({
                ...layer,
                x,
              }));
            }}
          />
        </div>
        <div className="px-3 text-sm">
          <NumberField
            label="y:"
            minValue={undefined}
            defaultValue={0}
            value={y}
            name="y"
            groupClassName="w-full"
            onChange={(y) => {
              setLayer((layer) => ({
                ...layer,
                y,
              }));
            }}
          />
        </div>
      </div>
    </>
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
          {_selectedLayerAtom ? (
            <SelectedLayer atom={_selectedLayerAtom} />
          ) : (
            <div className="mx-auto my-auto flex text-sm text-neutral-400">
              No layer selected
            </div>
          )}
        </div>
        <LayersList />
      </div>
    </div>
  );
}
