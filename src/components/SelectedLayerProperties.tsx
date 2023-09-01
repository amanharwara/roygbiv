import NumberField from "./NumberField";
import {
  AsciiEffectLayer,
  CommonPlaneObjectProps,
  GradientLayer,
  ImageLayer,
  PlaneLayer,
  useLayerStore,
} from "../stores/layers";
import Switch from "./Switch";
import {
  Label,
  Slider,
  SliderTrack,
  SliderOutput,
  SliderThumb,
} from "react-aria-components";
import SingleThumbSliderTrack from "./SliderTrack";
import { useRef } from "react";
import { Select, SelectItem } from "./Select";
import { GradientType } from "@react-three/drei";

function CommonPlaneLayerProperties({
  layer,
}: {
  layer: CommonPlaneObjectProps & { id: string };
}) {
  const { width, height, zoom, opacity, x, y } = layer;
  const defaultWidth = useRef(width);
  const defaultHeight = useRef(height);
  const updateLayer = useLayerStore((state) => state.updateLayer<PlaneLayer>);

  return (
    <>
      <div className="px-3 text-sm">
        <NumberField
          label="Width:"
          defaultValue={defaultWidth.current}
          value={width}
          name="width"
          groupClassName="w-full"
          onChange={(width) => {
            updateLayer(layer.id, {
              width,
            });
          }}
        />
      </div>
      <div className="px-3 text-sm">
        <NumberField
          label="Height:"
          defaultValue={defaultHeight.current}
          value={height}
          name="height"
          groupClassName="w-full"
          onChange={(height) => {
            updateLayer(layer.id, {
              height,
            });
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
            updateLayer(layer.id, {
              zoom,
            });
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
            updateLayer(layer.id, {
              opacity,
            });
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
            updateLayer(layer.id, {
              x,
            });
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
            updateLayer(layer.id, {
              y,
            });
          }}
        />
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

function GradientLayerProperties({ layer }: { layer: GradientLayer }) {
  const { colors, stops, gradientType } = layer;
  const updateLayer = useLayerStore(
    (state) => state.updateLayer<GradientLayer>,
  );

  return (
    <>
      <div className="px-3 text-sm">
        <div className="mb-2">Colors:</div>
        <div className="flex items-center gap-3.5">
          {colors.map((color, index) => (
            <div
              key={index}
              className="h-10 w-10 rounded"
              style={{
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
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
          value={stops}
          onChange={(stops) => {
            updateLayer(layer.id, {
              stops,
            });
          }}
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
          <SliderTrack className="relative h-[30px] w-full [grid-area:track] before:absolute before:top-1/2 before:block before:h-[3px] before:w-full before:-translate-y-1/2 before:bg-neutral-700">
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

function AsciiLayerProperties({ layer }: { layer: AsciiEffectLayer }) {
  const { bgColor, fgColor, invert, resolution } = layer;
  const updateLayer = useLayerStore(
    (state) => state.updateLayer<AsciiEffectLayer>,
  );

  return (
    <>
      <div className="px-3 text-sm">
        {/* Convert this to a color picker */}
        <div className="group flex flex-col items-start gap-1">
          <label htmlFor="ascii-bgColor">Background color:</label>
          <input
            id="ascii-bgColor"
            value={bgColor}
            onChange={(event) => {
              updateLayer(layer.id, {
                bgColor: event.target.value,
              });
            }}
            className="w-full rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>
      <div className="px-3 text-sm">
        {/* Convert this to a color picker */}
        <div className="group flex flex-col items-start gap-1">
          <label htmlFor="ascii-fgColor">Text color:</label>
          <input
            id="ascii-fgColor"
            value={fgColor}
            onChange={(event) => {
              updateLayer(layer.id, {
                fgColor: event.target.value,
              });
            }}
            className="w-full rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>
      <div className="px-3 text-sm">
        <div className="group flex flex-col items-start gap-1">
          <Switch
            isSelected={invert}
            onChange={(invert) => {
              updateLayer(layer.id, {
                invert,
              });
            }}
          >
            Invert
          </Switch>
        </div>
      </div>
      <div className="px-3 text-sm">
        <Slider
          defaultValue={0.15}
          minValue={0.05}
          maxValue={0.25}
          step={0.05}
          value={resolution}
          onChange={(resolution) => {
            updateLayer(layer.id, {
              resolution,
            });
          }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <Label>Level of detail:</Label>
            <SliderOutput>
              {({ state }) => {
                const value = state.getThumbValue(0);
                const min = state.getThumbMinValue(0);
                const max = state.getThumbMaxValue(0);
                const defaultValue = 0.15;
                if (value === min) {
                  return "Extremely low";
                } else if (value > min && value < defaultValue) {
                  return "Low";
                } else if (value < max && value > defaultValue) {
                  return "High";
                } else if (value === max) {
                  return "Extremely high";
                }
                return "Normal";
              }}
            </SliderOutput>
          </div>
          <SingleThumbSliderTrack />
        </Slider>
      </div>
    </>
  );
}

function SelectedLayerProperties() {
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const layers = useLayerStore((state) => state.layers);
  const layer = layers.find((layer) => layer.id === selectedLayerId);

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
      <div className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden py-3">
        {layer.type === "image" && <ImageLayerProperties layer={layer} />}
        {layer.type === "gradient" && <GradientLayerProperties layer={layer} />}
        {layer.type === "ascii" && <AsciiLayerProperties layer={layer} />}
      </div>
    </>
  );
}

export default SelectedLayerProperties;
