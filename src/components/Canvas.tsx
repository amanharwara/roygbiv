import { Canvas, useLoader } from "@react-three/fiber";
import { useCallback } from "react";
import { Dialog, Button, Popover } from "react-aria-components";
import { useCanvasStore } from "../stores/canvas";
import { TextureLoader } from "three";
import { ImageLayer, useLayerStore } from "../stores/layers";
import NumberField from "./NumberField";

function ImageLayerMesh({ layer }: { layer: ImageLayer }) {
  const { image, width, height, zoom, opacity, x, y } = layer;

  return (
    <mesh
      scale={[
        (width / image.naturalWidth) * zoom,
        (height / image.naturalHeight) * zoom,
        1,
      ]}
      position={[
        x + width / 2 - image.naturalWidth / 2,
        y + height / 2 - image.naturalHeight / 2,
        0,
      ]}
      frustumCulled={false}
    >
      <planeGeometry
        attach="geometry"
        args={[image.naturalWidth, image.naturalHeight]}
      />
      <meshBasicMaterial
        attach="material"
        map={useLoader(TextureLoader, image.src)}
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

export function SizedCanvas() {
  const { width, height } = useCanvasStore();
  const layers = useLayerStore((state) => state.layers);

  return (
    <div
      className="bg-black"
      style={{
        width,
        height,
      }}
    >
      <Canvas orthographic>
        {layers.toReversed().map((layer, index) => (
          <ImageLayerMesh key={index} layer={layer} />
        ))}
      </Canvas>
    </div>
  );
}

export function CanvasSettingsModal() {
  const { width, height, setSize } = useCanvasStore();

  const saveSettings = useCallback(
    (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      const formData = new FormData(event.currentTarget);
      const width = Number(formData.get("width"));
      const height = Number(formData.get("height"));
      setSize(width, height);
      close();
    },
    [setSize],
  );

  return (
    <Popover
      placement="bottom end"
      className="rounded border border-neutral-700 bg-neutral-800 p-3 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out "
    >
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
            <div className="flex flex-col gap-3">
              <NumberField
                label="Width:"
                defaultValue={width}
                name="width"
                autoFocus
              />
              <NumberField
                label="Height:"
                defaultValue={height}
                name="height"
              />
              <Button
                className="mt-1 rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm hover:bg-neutral-600"
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </Popover>
  );
}
