/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, ModalOverlay } from "react-aria-components";
import Button from "./ui/Button";
import { X as CloseIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Application, Assets, Container, NoiseFilter, Sprite } from "pixi.js";
import { useCanvasStore } from "../stores/canvas";
import { audioStore } from "../stores/audio";
import { preprocessTrackData } from "../audio/preprocessing";
import { Layer, useLayerStore } from "../stores/layers";
import { getEnergyForFreqs } from "../audio/analyzer";
import { AsciiFilter } from "pixi-filters";
import { ValueComputer } from "../utils/computedValue";

const VideoRenderModal = ({ closeModal }: { closeModal: () => void }) => {
  const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const pixiAppRef = useRef<Application>();
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    async function init() {
      if (pixiAppRef.current) return;

      if (!canvasContainer) return;
      const canvasStore = useCanvasStore.getState();

      const audio = audioStore.getState();
      const audioFile = audio.audioFile;
      if (!audioFile) return;

      const app = new Application({
        width: canvasStore.width,
        height: canvasStore.height,
        autoStart: false,
        sharedTicker: true,
      });
      app.ticker.autoStart = false;
      app.ticker.stop();
      pixiAppRef.current = app;
      canvasContainer.appendChild(app.view as HTMLCanvasElement);

      const { screen } = app;

      const ranges = structuredClone(audio.ranges);

      const { numberOfFrames, fps, fft, amp } = await preprocessTrackData(
        audioFile!,
      );
      app.ticker.minFPS = fps - 1;
      app.ticker.maxFPS = fps;

      for (const range of ranges) {
        const value = getEnergyForFreqs(fft[0]!, range.min, range.max);
        range.value = value;
      }

      let frame = 0;

      const valueComputer = new ValueComputer(
        () => amp[frame]!,
        (name: string) => {
          const range = ranges.find((r) => r.name === name);
          return range
            ? getEnergyForFreqs(fft[frame]!, range.min, range.max)
            : 0;
        },
      );

      const layerMap = new Map<Layer, Container>();

      const layers = useLayerStore.getState().layers.toReversed();
      for (const layer of layers) {
        if (layer.type === "image") {
          const texture = await Assets.load(layer.image.src);
          const sprite = new Sprite(texture);
          layerMap.set(layer, sprite);

          const wScale = layer.width / layer.image.width;
          const hScale = layer.height / layer.image.height;

          const computedScale = valueComputer.compute(
            layer.scale,
            sprite.scale.x,
          );
          sprite.scale.set(computedScale * wScale, computedScale * hScale);

          const finalX = layer.centered
            ? screen.width / 2 - sprite.width / 2
            : 0;
          const finalY = layer.centered
            ? screen.height / 2 - sprite.height / 2
            : 0;
          sprite.position.set(finalX + layer.x, finalY + layer.y);

          const computedOpacity = valueComputer.compute(layer.opacity);
          sprite.alpha = computedOpacity;

          sprite.filters = [];

          if (layer.effects.ascii.enabled) {
            const asciiEffect = new AsciiFilter(
              valueComputer.compute(layer.effects.ascii.size, 0),
            );
            sprite.filters.push(asciiEffect);
          }

          if (layer.effects.noise.enabled) {
            const noiseEffect = new NoiseFilter(
              valueComputer.compute(layer.effects.noise.amount, 0),
            );
            sprite.filters.push(noiseEffect);
          }

          app.stage.addChild(sprite);
        } else if (layer.type === "gradient") {
          //
        }
      }

      app.renderer.render(app.stage);

      callbackRef.current = () => {
        if (frame >= numberOfFrames) {
          app.ticker.remove(callbackRef.current!);
          app.ticker.stop();
          return;
        }
        for (const [layer, sprite] of layerMap) {
          if (layer.type === "image") {
            const wScale = layer.width / layer.image.width;
            const hScale = layer.height / layer.image.height;

            const computedScale = valueComputer.compute(
              layer.scale,
              sprite.scale.x,
            );
            sprite.scale.set(computedScale * wScale, computedScale * hScale);

            const finalX = layer.centered
              ? screen.width / 2 - sprite.width / 2
              : 0;
            const finalY = layer.centered
              ? screen.height / 2 - sprite.height / 2
              : 0;
            sprite.position.set(finalX + layer.x, finalY + layer.y);

            const computedOpacity = valueComputer.compute(layer.opacity);
            sprite.alpha = computedOpacity;

            const asciiEffect = sprite.filters?.find(
              (filter) => filter instanceof AsciiFilter,
            ) as AsciiFilter | undefined;
            if (asciiEffect) {
              asciiEffect.size = valueComputer.compute(
                layer.effects.ascii.size,
              );
            }

            const noiseEffect = sprite.filters?.find(
              (filter) => filter instanceof NoiseFilter,
            ) as NoiseFilter | undefined;
            if (noiseEffect) {
              noiseEffect.noise = valueComputer.compute(
                layer.effects.noise.amount,
              );
            }
          }
        }
        app.renderer.render(app.stage);
        frame++;
      };

      app.ticker.add(callbackRef.current);
      app.ticker.start();
    }

    void init();
  }, [canvasContainer]);

  useEffect(() => {
    return () => {
      if (callbackRef.current) {
        pixiAppRef.current?.ticker.remove(callbackRef.current);
      }
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
      }
    };
  }, []);

  return (
    <ModalOverlay
      isOpen
      className={({ isEntering, isExiting }) => `
		fixed inset-0 z-10 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur
		${isEntering ? "animate-in fade-in duration-300 ease-out" : ""}
		${isExiting ? "animate-out fade-out duration-200 ease-in" : ""}
	`}
    >
      <Modal
        className={({ isEntering, isExiting }) => `
            overflow-hidden rounded border border-neutral-700 bg-neutral-800 p-3 text-left align-middle shadow-xl
            ${isEntering ? "animate-in zoom-in-95 duration-300 ease-out" : ""}
            ${isExiting ? "animate-out zoom-out-95 duration-200 ease-in" : ""}
          `}
      >
        <Button
          onPress={closeModal}
          className="ml-auto rounded bg-neutral-700 p-1.5 hover:bg-neutral-600"
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
        <div ref={setCanvasContainer} />
      </Modal>
    </ModalOverlay>
  );
};

export default VideoRenderModal;
