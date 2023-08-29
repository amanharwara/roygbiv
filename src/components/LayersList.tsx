import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import {
  ListBox,
  MenuTrigger,
  TooltipTrigger,
  Button,
  Tooltip,
  Popover,
  Item,
  Menu,
} from "react-aria-components";
import AddIcon from "../icons/AddIcon";
import DeleteIcon from "../icons/DeleteIcon";
import ImageIcon from "../icons/ImageIcon";
import {
  selectedLayerAtom,
  layersAtom,
  createImageLayer,
  ImageLayer,
} from "../stores/layers";
import { readFileAsImage } from "../utils/readFile";

function LayerListItem({
  layerAtom,
}: {
  layerAtom: PrimitiveAtom<ImageLayer>;
}) {
  const layer = useAtomValue(layerAtom);

  return (
    <Item
      className="flex items-center gap-2 px-3 py-1.5 text-sm outline-none aria-selected:bg-neutral-700 aria-selected:font-medium"
      id={layerAtom.toString()}
    >
      {layer.type === "image" && <ImageIcon className="h-4 w-4" />}
      {layer.name}
    </Item>
  );
}

function LayersList() {
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
    <div className="flex flex-shrink-0 select-none flex-col">
      <div className="border-y border-neutral-600 px-3 py-2 text-sm font-semibold">
        Layers
      </div>
      <div className="min-h-0 flex-grow overflow-auto">
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
      <div className="flex items-center gap-2 border-t border-neutral-600 px-2 py-1.5">
        <MenuTrigger>
          <TooltipTrigger delay={150} closeDelay={0}>
            <Button className="flex items-center justify-center rounded p-1 hover:bg-neutral-600 data-[pressed]:bg-neutral-800">
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
            className="flex items-center justify-center rounded p-1 hover:bg-neutral-600 disabled:opacity-70"
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

export default LayersList;
