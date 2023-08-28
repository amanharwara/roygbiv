import { Canvas, useLoader } from "@react-three/fiber";
import { useAtomValue, useAtom } from "jotai";
import { useCallback } from "react";
import {
  Dialog,
  NumberField,
  Label,
  Input,
  Button,
  Popover,
} from "react-aria-components";
import { canvasSizeAtom, canvasImageAtom } from "../stores/canvas";
import { TextureLoader } from "three";

function Image({ image }: { image: HTMLImageElement }) {
  return (
    <mesh scale={[1, 1, 1]} up={[0, 1, 0]} frustumCulled={false}>
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
      />
    </mesh>
  );
}

export function SizedCanvas() {
  const { width, height } = useAtomValue(canvasSizeAtom);
  const image = useAtomValue(canvasImageAtom);

  return (
    <div
      className="bg-black"
      style={{
        width,
        height,
      }}
    >
      <Canvas orthographic>{image.src && <Image image={image} />}</Canvas>
    </div>
  );
}

export function CanvasSettingsModal() {
  const [{ width, height }, setSize] = useAtom(canvasSizeAtom);

  const saveSettings = useCallback(
    (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      const formData = new FormData(event.currentTarget);
      const width = Number(formData.get("width"));
      const height = Number(formData.get("height"));
      setSize({
        width,
        height,
      });
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
                className="group flex flex-col gap-1"
                defaultValue={width}
                name="width"
                autoFocus
              >
                <Label>Width:</Label>
                <Input className="rounded border border-transparent bg-neutral-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-neutral-500" />
              </NumberField>
              <NumberField
                className="group flex flex-col gap-1"
                defaultValue={height}
                name="height"
              >
                <Label>Height:</Label>
                <Input className="rounded border border-transparent bg-neutral-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-neutral-500" />
              </NumberField>
              <Button
                className="mt-2 rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm hover:bg-neutral-600"
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
