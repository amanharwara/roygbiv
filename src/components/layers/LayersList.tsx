import { useCallback } from "react";
import {
  ListBox,
  MenuTrigger,
  TooltipTrigger,
  Button,
  Popover,
  Menu,
  MenuItem,
  useDragAndDrop,
  Header,
  Section,
} from "react-aria-components";
import AddIcon from "../../icons/AddIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import ImageIcon from "../../icons/ImageIcon";
import { useLayerStore, Layer } from "../../stores/layers";
import { readFileAsImage } from "../../utils/readFile";
import Tooltip from "../ui/Tooltip";
import GradientIcon from "../../icons/GradientIcon";

function LayerListItem({ layer }: { layer: Layer }) {
  return (
    <MenuItem
      className="flex w-full items-center gap-2 overflow-hidden bg-neutral-900 px-3 py-1.5 text-sm outline-none aria-selected:bg-neutral-700 aria-selected:font-medium data-[dragging]:opacity-75"
      id={layer.id}
      textValue={layer.name}
    >
      {layer.type === "image" && (
        <ImageIcon className="h-4 w-4 flex-shrink-0" />
      )}
      {layer.type === "gradient" && (
        <GradientIcon className="h-4 w-4 flex-shrink-0" />
      )}
      <div className="overflow-hidden text-ellipsis">{layer.name}</div>
    </MenuItem>
  );
}

function LayersList() {
  const layers = useLayerStore((state) => state.layers);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useLayerStore((state) => state.setSelectedLayerId);
  const removeSelectedLayer = useLayerStore(
    (state) => state.removeSelectedLayer,
  );

  const addAndSelectImageLayer = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const image = await readFileAsImage(file);
        useLayerStore.getState().addImageLayer(image, file.name);
      }
    };
    input.click();
  }, []);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": key as string })),
    onReorder(e) {
      const draggedKey = [...e.keys][0];
      const targetKey = e.target.key;
      if (
        !(typeof draggedKey === "string") ||
        !(typeof targetKey === "string")
      ) {
        return;
      }
      moveLayer(e.target.dropPosition, targetKey, draggedKey);
    },
  });

  return (
    <div className="flex flex-shrink-0 select-none flex-col overflow-hidden">
      <div className="border-y border-neutral-600 px-3 py-2 text-sm font-semibold">
        Layers
      </div>
      <div className="min-h-0 flex-grow overflow-auto">
        <ListBox
          className="w-full overflow-hidden py-px"
          aria-label="Layers"
          items={layers}
          selectedKeys={selectedLayerId ? [selectedLayerId] : []}
          selectionMode="single"
          selectionBehavior="replace"
          onSelectionChange={(keys) => {
            if (keys !== "all") {
              keys.forEach((key) => {
                if (!(typeof key === "string")) {
                  return;
                }
                setSelectedLayerId(key);
              });
            }
          }}
          dragAndDropHooks={dragAndDropHooks}
        >
          {layers.map((layer) => (
            <LayerListItem key={layer.id} layer={layer} />
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
              className="max-h-[inherit] min-w-[12rem] select-none space-y-2 overflow-auto px-1.5 pb-1.5 pt-2 outline-none"
              onAction={(key) => {
                if (key === "add-image") {
                  addAndSelectImageLayer();
                } else if (key === "add-gradient") {
                  useLayerStore.getState().addGradientLayer();
                } else if (key === "add-waveform") {
                  useLayerStore.getState().addWaveformLayer();
                } else if (key === "add-iris-visualizer") {
                  useLayerStore.getState().addIrisVisualizerLayer();
                }
              }}
            >
              <Section>
                <Header className="px-1.5 pb-1 text-sm font-semibold">
                  Objects
                </Header>
                <MenuItem
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                  id="add-image"
                >
                  <ImageIcon className="h-4 w-4" />
                  Image
                </MenuItem>
                <MenuItem
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                  id="add-gradient"
                >
                  <GradientIcon className="h-4 w-4" />
                  Gradient
                </MenuItem>
                <MenuItem
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                  id="add-waveform"
                >
                  <GradientIcon className="h-4 w-4" />
                  Waveform
                </MenuItem>
                <MenuItem
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                  id="add-iris-visualizer"
                >
                  <GradientIcon className="h-4 w-4" />
                  Iris Visualizer
                </MenuItem>
              </Section>
            </Menu>
          </Popover>
        </MenuTrigger>
        <TooltipTrigger delay={150} closeDelay={0}>
          <Button
            onPress={removeSelectedLayer}
            className="flex items-center justify-center rounded p-1 hover:bg-neutral-600 disabled:opacity-70"
            isDisabled={!selectedLayerId}
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
