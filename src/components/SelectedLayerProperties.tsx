import NumberField from "./NumberField";
import { AsciiEffectLayer, ImageLayer, useLayerStore } from "../stores/layers";

function ImageLayerProperties({ layer }: { layer: ImageLayer }) {
  const { name, image, width, height, zoom, opacity, x, y } = layer;
  const updateLayer = useLayerStore((state) => state.updateLayer<ImageLayer>);

  return (
    <>
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
            updateLayer(layer.id, {
              width,
            });
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
        {/* Convert this to a color picker */}
        <div className="group flex flex-col items-start gap-1">
          <label>Invert:</label>
          <input
            type="checkbox"
            checked={invert}
            onChange={(event) => {
              updateLayer(layer.id, {
                invert: event.target.checked,
              });
            }}
          />
        </div>
      </div>
      <div className="px-3 text-sm">
        {/* Convert this to a slider instead and max to 25% */}
        <NumberField
          label="Level of detail:"
          defaultValue={0.15}
          maxValue={1}
          value={resolution}
          name="resolution"
          groupClassName="w-full"
          onChange={(resolution) => {
            updateLayer(layer.id, {
              resolution,
            });
          }}
          step={0.05}
          formatOptions={{
            style: "percent",
          }}
        />
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
        {layer.type === "ascii" && <AsciiLayerProperties layer={layer} />}
      </div>
    </>
  );
}

export default SelectedLayerProperties;
