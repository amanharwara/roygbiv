import NumberField from "../ui/NumberField";
import {
  CommonPlaneObjectProps,
  GradientLayer,
  ImageLayer,
  Layer,
  PlaneLayer,
  useLayerStore,
} from "../../stores/layers";
import {
  Label,
  Slider,
  SliderTrack,
  SliderOutput,
  SliderThumb,
  TooltipTrigger,
  Button,
  DialogTrigger,
  Dialog,
  Popover,
  ToggleButton,
} from "react-aria-components";
import { useCallback, useRef, useState } from "react";
import { Select, SelectItem } from "../ui/Select";
import { Edit2 as EditIcon } from "lucide-react";
import { Trash as DeleteIcon } from "lucide-react";
import { Plus as AddIcon } from "lucide-react";
import { X as CloseIcon } from "lucide-react";
import Tooltip from "../ui/Tooltip";
import ColorSlider from "../ui/ColorSlider";
import { Color, parseColor } from "@react-stately/color";
import { getRandomColor } from "../../utils/gradientUtils";
import ComputedProperty from "./ComputedProperty";
import Switch from "../ui/Switch";
import { Link, Unlink } from "lucide-react";
import { twMerge } from "tailwind-merge";
import TextField from "../ui/TextField";
import { GradientType } from "../../textures/GradientTexture";

// TODO: All the components here re-render when any property of the layer changes.

function CommonPlaneLayerProperties({
  layer,
}: {
  layer: CommonPlaneObjectProps & { id: string };
}) {
  const { width, height, x, y, maintainAspect, effects } = layer;
  const { noise, ascii } = effects;
  const defaultWidth = useRef(width);
  const defaultHeight = useRef(height);
  const updateLayer = useLayerStore((state) => state.updateLayer<PlaneLayer>);

  return (
    <>
      <div className="relative z-0 flex items-center gap-3 pr-3 text-sm">
        <TooltipTrigger delay={150} closeDelay={0}>
          <ToggleButton
            isSelected={maintainAspect}
            onChange={(maintainAspect) => {
              updateLayer(layer.id, {
                maintainAspect,
              });
            }}
            className={twMerge(
              "ml-2 flex-shrink-0 select-none rounded border border-neutral-600 bg-neutral-700 p-1 outline-none hover:bg-neutral-600 focus:border-slate-400",
              "before:absolute before:top-1/2 before:z-[-1] before:h-[75%] before:w-3.5 before:-translate-y-1/2 before:rounded-lg before:rounded-br-none before:rounded-tr-none before:border before:border-r-0 before:border-neutral-700",
            )}
          >
            {maintainAspect ? (
              <Unlink className="h-3 w-3" />
            ) : (
              <Link className="h-3 w-3" />
            )}
          </ToggleButton>
          <Tooltip placement="top" offset={8}>
            {maintainAspect ? "Unlink aspect ratio" : "Link aspect ratio"}
          </Tooltip>
        </TooltipTrigger>
        <div className="flex-grow">
          <NumberField
            label="Width:"
            defaultValue={defaultWidth.current}
            value={width}
            name="width"
            groupClassName="w-full"
            onChange={(width) => {
              updateLayer(layer.id, {
                width,
                height: maintainAspect
                  ? (width / defaultWidth.current) * defaultHeight.current
                  : height,
              });
            }}
          />
          <div className="py-1.5"></div>
          <NumberField
            label="Height:"
            defaultValue={defaultHeight.current}
            value={height}
            name="height"
            groupClassName="w-full"
            onChange={(height) => {
              updateLayer(layer.id, {
                width: maintainAspect
                  ? (height / defaultHeight.current) * defaultWidth.current
                  : width,
                height,
              });
            }}
          />
        </div>
      </div>
      <div className="px-3 text-sm">
        <ComputedProperty id="scale" name="Scale" layer={layer as Layer} />
      </div>
      <div className="px-3 text-sm">
        <ComputedProperty id="opacity" name="Opacity" layer={layer as Layer} />
      </div>
      <div className="px-3 text-sm">
        <Switch
          isSelected={layer.centered}
          onChange={(centered) => {
            updateLayer(layer.id, {
              centered,
            });
          }}
          className="flex-row-reverse justify-end"
        >
          Centered:
        </Switch>
      </div>
      <div className="px-3 text-sm">
        <NumberField
          label="x-offset:"
          minValue={undefined}
          defaultValue={0}
          value={x}
          name="x"
          groupClassName="w-full"
          onChange={(x) => {
            updateLayer(layer.id, {
              x,
            });
          }}
        />
      </div>
      <div className="px-3 text-sm">
        <NumberField
          label="y-offset:"
          minValue={undefined}
          defaultValue={0}
          value={y}
          name="y"
          groupClassName="w-full"
          onChange={(y) => {
            updateLayer(layer.id, {
              y,
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-neutral-600 px-3 pt-3 text-sm">
        <div className="font-medium">ASCII (effect)</div>
        <Switch
          isSelected={ascii.enabled}
          onChange={(enabled) => {
            updateLayer(layer.id, {
              effects: {
                ...effects,
                ascii: {
                  ...ascii,
                  enabled,
                },
              },
            });
          }}
          className="flex-row-reverse justify-end"
        >
          Enabled:
        </Switch>
        {ascii.enabled && (
          <div className="flex flex-col items-start gap-3">
            <TextField
              label="Amount:"
              className="w-full"
              value={ascii.size.value}
              onChange={(value) => {
                updateLayer(layer.id, {
                  effects: {
                    ...effects,
                    ascii: {
                      ...ascii,
                      size: {
                        ...ascii.size,
                        value,
                      },
                    },
                  },
                });
              }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-neutral-600 px-3 pt-3 text-sm">
        <div className="font-medium">Noise (effect)</div>
        <Switch
          isSelected={noise.enabled}
          onChange={(enabled) => {
            updateLayer(layer.id, {
              effects: {
                ...effects,
                noise: {
                  ...noise,
                  enabled,
                },
              },
            });
          }}
          className="flex-row-reverse justify-end"
        >
          Enabled:
        </Switch>
        {noise.enabled && (
          <div className="flex flex-col items-start gap-3">
            <TextField
              label="Amount:"
              className="w-full"
              value={noise.amount.value}
              onChange={(value) => {
                updateLayer(layer.id, {
                  effects: {
                    ...effects,
                    noise: {
                      ...noise,
                      amount: {
                        ...noise.amount,
                        value,
                      },
                    },
                  },
                });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function ImageLayerProperties({ layer }: { layer: ImageLayer }) {
  const { name, image } = layer;

  return (
    <>
      <div className="px-3 text-sm">
        Preview:
        <div className="mt-2 flex items-center justify-center rounded border border-neutral-600 p-2">
          <img src={image.src} alt={name} className="max-h-32 max-w-full" />
        </div>
      </div>
      <CommonPlaneLayerProperties layer={layer} />
    </>
  );
}

function ColorButton({
  color,
  onChangeEnd,
}: {
  color: string;
  onChangeEnd: (color: Color) => void;
}) {
  return (
    <div className="group/main relative">
      <DialogTrigger>
        <Button
          className="group h-14 w-14 rounded"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="sr-only">Choose color</span>
          <div
            className="flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-[opacity,colors] duration-75 group-hover:opacity-100 group-hover:[outline:-webkit-focus-ring-color_auto_1px] group-focus:opacity-100 group-focus:[outline:-webkit-focus-ring-color_auto_1px]"
            role="presentation"
          >
            <EditIcon className="h-6 w-6" />
          </div>
        </Button>
        <Popover
          placement="bottom end"
          className="rounded border border-neutral-700 bg-neutral-800 p-3 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out "
        >
          <ColorDialog color={color} onChangeEnd={onChangeEnd} />
        </Popover>
      </DialogTrigger>
    </div>
  );
}

function ColorDialog({
  color,
  onChangeEnd,
}: {
  color: string;
  onChangeEnd: (color: Color) => void;
}) {
  const [parsedColor, setParsedColor] = useState(() =>
    parseColor(color).toFormat("hsl"),
  );

  const onChange = useCallback((color: Color) => {
    setParsedColor(color);
  }, []);

  return (
    <Dialog className="flex select-none flex-col gap-3 outline-none">
      {({ close }) => (
        <>
          <div className="mb-3 flex w-full">
            <Button
              onPress={close}
              className="ml-auto rounded bg-neutral-700 p-1.5 hover:bg-neutral-600"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
          <ColorSlider
            channel="hue"
            value={parsedColor}
            onChange={onChange}
            onChangeEnd={onChangeEnd}
          />
          <ColorSlider
            channel="saturation"
            value={parsedColor}
            onChange={onChange}
            onChangeEnd={onChangeEnd}
          />
          <ColorSlider
            channel="lightness"
            value={parsedColor}
            onChange={onChange}
            onChangeEnd={onChangeEnd}
          />
        </>
      )}
    </Dialog>
  );
}

function GradientLayerProperties({ layer }: { layer: GradientLayer }) {
  const { colors, gradientType } = layer;
  const updateLayer = useLayerStore(
    (state) => state.updateLayer<GradientLayer>,
  );

  return (
    <>
      <div className="px-3 text-sm">
        <div className="mb-2">Colors:</div>
        <div className="flex flex-wrap items-center gap-4">
          {colors.map((color, index) => (
            <div className="group/main relative" key={index}>
              <ColorButton
                color={color}
                onChangeEnd={(color: Color) => {
                  useLayerStore
                    .getState()
                    .updateColorInGradientLayer(
                      layer.id,
                      index,
                      color.toString("css"),
                    );
                }}
              />
              {colors.length > 2 && (
                <button
                  className="absolute right-0 top-0 -translate-y-2 translate-x-2 rounded bg-neutral-700 p-1.5 opacity-0 hover:bg-neutral-800 hover:[outline:-webkit-focus-ring-color_auto_1px] group-focus-within/main:opacity-100 group-hover/main:opacity-100"
                  onClick={() => {
                    useLayerStore
                      .getState()
                      .removeColorFromGradientLayer(layer.id, index);
                  }}
                >
                  <span className="sr-only">Remove color</span>
                  <DeleteIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <TooltipTrigger delay={150} closeDelay={0}>
            <Button
              onPress={() => {
                useLayerStore
                  .getState()
                  .addColorToGradientLayer(layer.id, getRandomColor());
              }}
              className="flex h-14 w-14 items-center justify-center rounded bg-neutral-700 hover:bg-neutral-800 hover:[outline:-webkit-focus-ring-color_auto_1px]"
            >
              <span className="sr-only">Add color</span>
              <AddIcon className="h-6 w-6" />
            </Button>
            <Tooltip placement="bottom" offset={8}>
              Add color
            </Tooltip>
          </TooltipTrigger>
        </div>
      </div>
      <div className="px-3 text-sm">
        <Switch
          isSelected={layer.useDynamicStops}
          onChange={(useDynamicStops) => {
            updateLayer(layer.id, {
              useDynamicStops,
            });
          }}
          className="flex-row-reverse justify-end"
        >
          Use dynamic stops:
        </Switch>
      </div>
      {layer.useDynamicStops && (
        <div className="flex flex-col gap-3 px-3 text-sm">
          {layer.dynamicStops.map((stop, index) => (
            <div className="flex items-center gap-3" key={index}>
              <div
                className="h-8 w-8 rounded border border-neutral-600"
                style={{
                  backgroundColor: colors[index],
                }}
              />
              <TextField
                className="flex-grow"
                label={<>`Stop ${index + 1}:`</>}
                srOnlyLabel={true}
                value={stop.value}
                onChange={(value) => {
                  updateLayer(layer.id, {
                    dynamicStops: layer.dynamicStops.map((s, i) =>
                      i === index ? { ...s, value } : s,
                    ),
                  });
                }}
              />
            </div>
          ))}
        </div>
      )}
      {!layer.useDynamicStops && (
        <div className="px-3 text-sm">
          <Slider
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gridTemplateAreas: `"label output" "track track"`,
            }}
            minValue={0}
            maxValue={1}
            step={0.01}
            value={layer.stops}
            onChange={(stops) => {
              updateLayer(layer.id, {
                stops,
              });
            }}
            key={layer.stops.length}
          >
            <Label>Color stops:</Label>
            <SliderOutput
              style={{
                gridArea: "output",
              }}
            >
              {({ state }) =>
                state.values
                  .map((_, i) => state.getThumbValueLabel(i))
                  .join(" – ")
              }
            </SliderOutput>
            <SliderTrack className="relative h-[25px] w-full [grid-area:track] before:absolute before:top-1/2 before:block before:h-1 before:w-full before:-translate-y-1/2 before:bg-neutral-700">
              {({ state }) =>
                state.values.map((_, i) => (
                  <SliderThumb
                    className="top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white"
                    key={i}
                    index={i}
                  />
                ))
              }
            </SliderTrack>
          </Slider>
        </div>
      )}
      <div className="px-3 text-sm">
        <Select
          label="Gradient type:"
          items={[
            {
              id: GradientType.Linear,
              name: "Linear",
            },
            {
              id: GradientType.Radial,
              name: "Radial",
            },
          ]}
          selectedKey={gradientType}
          onSelectionChange={(selected) =>
            updateLayer(layer.id, {
              gradientType: selected as GradientType,
            })
          }
        >
          {(item) => <SelectItem>{item.name}</SelectItem>}
        </Select>
      </div>
      <CommonPlaneLayerProperties layer={layer} />
    </>
  );
}

function SelectedLayerProperties() {
  const selectedLayerIDs = useLayerStore((state) => state.selectedLayerIDs);
  const layers = useLayerStore((state) => state.layers);

  if (selectedLayerIDs.length > 1) {
    return (
      <div className="mx-auto my-auto flex text-sm text-neutral-400">
        Multiple layers selected
      </div>
    );
  }

  const layer = layers.find((layer) => layer.id === selectedLayerIDs[0]);

  if (!layer) {
    return (
      <div className="mx-auto my-auto flex text-sm text-neutral-400">
        No layer selected
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap border-b border-neutral-600 px-3 py-2 text-sm font-semibold">
        {layer.name}
      </div>
      <div className="relative flex flex-col gap-4 overflow-y-auto overflow-x-hidden py-3">
        {layer.type === "image" && <ImageLayerProperties layer={layer} />}
        {layer.type === "gradient" && <GradientLayerProperties layer={layer} />}
      </div>
    </>
  );
}

export default SelectedLayerProperties;
