import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import { Dialog, Button, Popover } from "react-aria-components";
import { useCanvasStore } from "../stores/canvas";
import { Mesh } from "three";
import {
  GradientLayer,
  ImageLayer,
  WaveformLayer,
  useLayerStore,
} from "../stores/layers";
import NumberField from "./ui/NumberField";
import { GradientTexture } from "../three/GradientTexture";
import { WaveformTexture } from "../three/WaveformTexture";
import { IrisVisualizer } from "../three/IrisVisualizer";
import { Image, useAspect } from "@react-three/drei";

function ImageLayerMesh({
  layer,
  index,
}: {
  layer: ImageLayer;
  index: number;
}) {
  const { image, width, height, zoom, scale, opacity, x, y } = layer;

  const size = useAspect(width, height, scale);

  const ref = useRef<Mesh>(null!);

  return (
    <group position={[x, y, index]}>
      <Image
        scale={[size[0], size[1]]}
        zoom={zoom}
        ref={ref}
        url={image.src}
        transparent
        opacity={opacity}
      />
    </group>
  );
}

function GradientLayerMesh({
  layer,
  index,
}: {
  layer: GradientLayer;
  index: number;
}) {
  const { width, height, scale, opacity, x, y, stops, colors, gradientType } =
    layer;
  const { size } = useThree();
  return (
    <mesh
      scale={useAspect(width, height, scale)}
      position={[
        x + width / 2 - size.width / 2,
        y + height / 2 - size.height / 2,
        index,
      ]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={opacity}
      >
        <GradientTexture
          stops={stops}
          colors={colors}
          /* @ts-expect-error - https://github.com/pmndrs/drei/blob/master/src/core/GradientTexture.tsx#L24 */
          type={gradientType}
          size={size.height}
          width={size.width}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

function WaveformLayerMesh({
  layer,
  index,
}: {
  layer: WaveformLayer;
  index: number;
}) {
  const { width, height, scale, opacity, x, y } = layer;
  const { size } = useThree();
  return (
    <mesh
      scale={[(width / size.width) * scale, (height / size.height) * scale, 1]}
      position={[
        x + width / 2 - size.width / 2,
        y + height / 2 - size.height / 2,
        index,
      ]}
      frustumCulled={false}
    >
      <planeGeometry args={[size.width, size.height]} />
      <meshBasicMaterial
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={opacity}
      >
        <WaveformTexture />
      </meshBasicMaterial>
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
      <Canvas>
        {layers
          .toReversed()
          .map((layer, index) =>
            layer.type === "image" ? (
              <ImageLayerMesh key={layer.id} layer={layer} index={index} />
            ) : layer.type === "gradient" ? (
              <GradientLayerMesh key={layer.id} layer={layer} index={index} />
            ) : layer.type === "waveform" ? (
              <WaveformLayerMesh key={layer.id} layer={layer} index={index} />
            ) : layer.type === "irisVisualizer" ? (
              <IrisVisualizer key={layer.id} layer={layer} index={index} />
            ) : null,
          )}
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
