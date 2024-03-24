import { Canvas, Viewport, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import { Dialog, Button, Popover } from "react-aria-components";
import { useCanvasStore } from "../stores/canvas";
import { Mesh } from "three";
import { GradientLayer, ImageLayer, useLayerStore } from "../stores/layers";
import NumberField from "./ui/NumberField";
import { GradientTexture } from "../three/GradientTexture";
import { Image, useAspect } from "@react-three/drei";
import { store } from "../audio/store";
import { mapNumber } from "../utils/numbers";
import { lerp } from "three/src/math/MathUtils";

function aspect(
  width: number,
  height: number,
  factor: number = 1,
  viewport: Viewport,
): [number, number, number] {
  const adaptedHeight =
    height *
    (viewport.aspect > width / height
      ? viewport.width / width
      : viewport.height / height);
  const adaptedWidth =
    width *
    (viewport.aspect > width / height
      ? viewport.width / width
      : viewport.height / height);
  return [adaptedWidth * factor, adaptedHeight * factor, 1];
}

function computedValue(value: string) {
  try {
    const volume = store.getState().level;
    // Declaring map so that it can be used in eval
    const map = mapNumber;
    return eval(value.replace(/volume/g, volume.toString()));
  } catch {
    /* empty */
  }
  try {
    return parseFloat(value);
  } catch {
    /* empty */
  }
  throw new Error("Invalid value");
}

function ImageLayerMesh({
  layer,
  index,
}: {
  layer: ImageLayer;
  index: number;
}) {
  const { image, width, height, zoom, scale, opacity, x, y } = layer;

  // const computedScale = useComputedValue(scale);

  // const size = useAspect(width, height, computedScale);

  const viewport = useThree((state) => state.viewport);

  const ref = useRef<Mesh>(null!);

  useFrame(() => {
    const computedScale = computedValue(scale);
    const [wScale, hScale] = aspect(width, height, computedScale, viewport);
    const currentScaleX = ref.current.scale.x;
    const currentScaleY = ref.current.scale.y;
    const wScaleLerp = lerp(
      isNaN(currentScaleX) ? 1 : currentScaleX,
      wScale,
      0.05,
    );
    const hScaleLerp = lerp(
      isNaN(currentScaleY) ? 1 : currentScaleY,
      hScale,
      0.05,
    );
    ref.current.scale.set(wScaleLerp, hScaleLerp, 1);
  });

  return (
    <group position={[x, y, index]}>
      <Image
        // scale={[size[0], size[1]]}
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
      position={[x, y, index]}
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
        {layers
          .toReversed()
          .map((layer, index) =>
            layer.type === "image" ? (
              <ImageLayerMesh key={layer.id} layer={layer} index={index} />
            ) : layer.type === "gradient" ? (
              <GradientLayerMesh key={layer.id} layer={layer} index={index} />
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
