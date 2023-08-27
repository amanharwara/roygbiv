import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { useCallback, useRef } from "react";
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

function Image({ src }: { src: string }) {
  // return (
  //   <mesh position={[0, 0, 0]}>
  //     <planeGeometry args={[10, 10 * 0.75]} />
  //     <meshStandardMaterial map={useLoader(TextureLoader, src)} />
  //   </mesh>
  // );
  return (
    <sprite
      position={[0, 0, 0]}
      scale={[10, 10 * 0.75, 1]}
      material-map={useLoader(TextureLoader, src)}
    />
  );
}

export function SizedCanvas() {
  const { width, height } = useAtomValue(canvasSizeAtom);
  const imageUrl = useAtomValue(canvasImageAtom);
  console.log(imageUrl);

  return (
    <div
      className="bg-black"
      style={{
        width,
        height,
      }}
    >
      <Canvas>
        <ambientLight />
        {/* <rectAreaLight
          width={10}
          height={10}
          color="white"
          intensity={1}
          position={[0, 0, 0]}
        /> */}
        {imageUrl && <Image src={imageUrl} />}
      </Canvas>
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
      className="data-[entering]:animate-fade-in data-[exiting]:animate-fade-out fixed inset-0 flex items-center justify-center bg-black/50"
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
                  onChange={(fileList) => {
                    if (!fileList) return;
                    const files = Array.from(fileList);
                    if (!files.length) return;
                    const file = files[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setImage(url);
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
