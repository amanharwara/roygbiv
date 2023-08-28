import { Canvas, useLoader } from "@react-three/fiber";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  ModalOverlay,
  Modal,
  Dialog,
  NumberField,
  Label,
  Input,
  Button,
  FileTrigger,
} from "react-aria-components";
import { canvasSizeAtom, canvasImageAtom } from "../stores/canvas";
import { TextureLoader } from "three";
import { readFileAsImage } from "../utils/readFile";

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
  const setImage = useSetAtom(canvasImageAtom);

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
    <ModalOverlay
      className="fixed inset-0 flex items-center justify-center bg-black/50 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out"
      isDismissable
    >
      <Modal className="max-w-[50vw] rounded bg-gray-800 p-6" isDismissable>
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
              <div className="flex flex-col gap-4">
                <NumberField
                  className="group flex flex-col gap-1"
                  defaultValue={width}
                  name="width"
                  autoFocus
                >
                  <Label>Width:</Label>
                  <Input className="rounded border border-transparent bg-gray-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-slate-950" />
                </NumberField>
                <NumberField
                  className="group flex flex-col gap-1"
                  defaultValue={height}
                  name="height"
                >
                  <Label>Height:</Label>
                  <Input className="rounded border border-transparent bg-gray-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-slate-950" />
                </NumberField>
                <FileTrigger
                  onChange={async (fileList) => {
                    if (!fileList) return;
                    const files = Array.from(fileList);
                    if (!files.length) return;
                    const file = files[0];
                    if (!file) return;
                    setImage(await readFileAsImage(file));
                  }}
                >
                  <Button className="rounded bg-gray-700 px-2 py-1.5 text-sm hover:bg-gray-900">
                    Select a file
                  </Button>
                </FileTrigger>
                <Button
                  className="rounded bg-gray-700 px-2 py-1.5 text-sm hover:bg-gray-900"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
