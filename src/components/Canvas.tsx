import { Canvas } from "@react-three/fiber";
import { atom, useAtomValue, useAtom } from "jotai";
import { useCallback } from "react";
import {
  ModalOverlay,
  Modal,
  Dialog,
  NumberField,
  Label,
  Input,
  Button,
} from "react-aria-components";

const canvasSizeAtom = atom({
  width: 1280,
  height: 720,
});

export function SizedCanvas() {
  const { width, height } = useAtomValue(canvasSizeAtom);

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
        <pointLight position={[10, 10, 10]} />
      </Canvas>
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
