/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, ModalOverlay } from "react-aria-components";
import Button from "./ui/Button";
import { X as CloseIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Application,
  Assets,
  Container,
  NoiseFilter,
  Sprite,
  Ticker,
} from "pixi.js";
import { useCanvasStore } from "../stores/canvas";
import { audioStore } from "../stores/audio";
import { preprocessTrackData } from "../audio/preprocessing";
import { ComputedProperty, Layer, useLayerStore } from "../stores/layers";
import { getRandomNumber, mapNumber, lerp as lerpUtil } from "../utils/numbers";
import { getEnergyForFreqs } from "../audio/analyzer";
import { AsciiFilter } from "pixi-filters";

const VideoRenderModal = ({ closeModal }: { closeModal: () => void }) => {
  const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const pixiAppRef = useRef<Application>();
  const lastRaf = useRef<number>();

  useEffect(() => {
    async function init() {
      if (!canvasContainer) return;
      const canvasStore = useCanvasStore.getState();

      const audio = audioStore.getState();
      const audioFile = audio.audioFile;
      if (!audioFile) return;

      const app = new Application({
        width: canvasStore.width,
        height: canvasStore.height,
        autoStart: false,
      });
      pixiAppRef.current = app;
      canvasContainer.appendChild(app.view);

      const { screen } = app;

      const ranges = structuredClone(audio.ranges);

      const { numberOfFrames, fft, amp } = await preprocessTrackData(
        audioFile!,
      );

      for (const range of ranges) {
        const value = getEnergyForFreqs(fft[0]!, range.min, range.max);
        range.value = value;
      }

      function computedValue(
        property: ComputedProperty,
        frame: number,
        prevValue?: number,
      ) {
        try {
          // Declaring variables so they can be used in eval
          const volume = amp[frame];
          const map = mapNumber;
          const random = getRandomNumber;
          const fRange = (name: string) => {
            const range = ranges.find((r) => r.name === name);
            return range
              ? getEnergyForFreqs(fft[frame]!, range.min, range.max)
              : 0;
          };
          let prev = prevValue;
          if (prev === undefined || isNaN(prev)) {
            prev = 0;
          }
          const lerp = lerpUtil;
          let result = eval(property.value);
          if (property.min !== undefined) {
            result = Math.max(result, property.min);
          }
          if (property.max !== undefined) {
            result = Math.min(result, property.max);
          }
          return result;
        } catch {
          /* empty */
        }
        return property.default;
      }

      const layerMap = new Map<Layer, Container>();

      const layers = useLayerStore.getState().layers.toReversed();
      for (const layer of layers) {
        if (layer.type === "image") {
          const texture = await Assets.load(layer.image.src);
          const sprite = new Sprite(texture);
          layerMap.set(layer, sprite);

          const wScale = layer.width / layer.image.width;
          const hScale = layer.height / layer.image.height;

          const computedScale = computedValue(layer.scale, 0, sprite.scale.x);
          sprite.scale.set(computedScale * wScale, computedScale * hScale);

          const finalX = layer.centered
            ? screen.width / 2 - sprite.width / 2
            : 0;
          const finalY = layer.centered
            ? screen.height / 2 - sprite.height / 2
            : 0;
          sprite.position.set(finalX + layer.x, finalY + layer.y);

          const computedOpacity = computedValue(layer.opacity, 0);
          sprite.alpha = computedOpacity;

          sprite.filters = [];

          if (layer.effects.ascii.enabled) {
            const asciiEffect = new AsciiFilter(
              computedValue(layer.effects.ascii.size, 0),
            );
            sprite.filters.push(asciiEffect);
          }

          if (layer.effects.noise.enabled) {
            const noiseEffect = new NoiseFilter(
              computedValue(layer.effects.noise.amount, 0),
            );
            sprite.filters.push(noiseEffect);
          }

          app.stage.addChild(sprite);
        } else if (layer.type === "gradient") {
          //
        }
      }

      app.renderer.render(app.stage);

      let frame = 0;
      const rafCallback = () => {
        for (const [layer, sprite] of layerMap) {
          if (layer.type === "image") {
            const wScale = layer.width / layer.image.width;
            const hScale = layer.height / layer.image.height;

            const computedScale = computedValue(
              layer.scale,
              frame,
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

            const computedOpacity = computedValue(layer.opacity, frame);
            sprite.alpha = computedOpacity;

            const asciiEffect = sprite.filters?.find(
              (filter) => filter instanceof AsciiFilter,
            ) as AsciiFilter | undefined;
            if (asciiEffect) {
              asciiEffect.size = computedValue(layer.effects.ascii.size, frame);
            }

            const noiseEffect = sprite.filters?.find(
              (filter) => filter instanceof NoiseFilter,
            ) as NoiseFilter | undefined;
            if (noiseEffect) {
              noiseEffect.noise = computedValue(
                layer.effects.noise.amount,
                frame,
              );
            }
          }
        }
        app.renderer.render(app.stage);
        frame++;
        if (frame < numberOfFrames) {
          lastRaf.current = requestAnimationFrame(rafCallback);
        }
      };
      lastRaf.current = requestAnimationFrame(rafCallback);
    }

    void init();
  }, [canvasContainer]);

  useEffect(() => {
    return () => {
      if (lastRaf.current) {
        cancelAnimationFrame(lastRaf.current);
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
