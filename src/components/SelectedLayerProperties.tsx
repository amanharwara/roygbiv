import NumberField from "./NumberField";
import { useLayerStore } from "../stores/layers";

function SelectedLayerProperties() {
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const layers = useLayerStore((state) => state.layers);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const layer = layers.find((layer) => layer.id === selectedLayerId);

  if (!layer) {
    return (
      <div className="mx-auto my-auto flex text-sm text-neutral-400">
        No layer selected
      </div>
    );
  }

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
      </div>
    </>
  );
}

export default SelectedLayerProperties;
