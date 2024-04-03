/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stage, Sprite, useTick, useApp, Graphics } from "@pixi/react";
import { Sprite as PSprite } from "pixi.js";
import { useCanvasStore } from "../stores/canvas";
import {
  ComputedProperty,
  useLayerStore,
  ImageLayer as TImageLayer,
  GradientLayer as TGradientLayer,
} from "../stores/layers";
import { audioElement, isAudioPaused } from "../audio/context";
import { audioStore, getRangeValue } from "../audio/store";
import { mapNumber, getRandomNumber } from "../utils/numbers";
import { ComponentProps, useCallback, useRef } from "react";

type GraphicsDrawCallback = NonNullable<
  ComponentProps<typeof Graphics>["draw"]
>;

function computedValue(property: ComputedProperty) {
  try {
    // Declaring variables so they can be used in eval
    const volume = audioStore.getState().level;
    const time = audioElement.currentTime;
    const map = mapNumber;
    const random = isAudioPaused() ? () => 0 : getRandomNumber;
    const fRange = getRangeValue;
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

// TODO: Zoom, effects
function ImageLayer({ layer }: { layer: TImageLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { image, x, y, scale, opacity, centered } = layer;

  const spriteRef = useRef<PSprite>(null);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const computedScale = computedValue(scale);
    sprite.scale.set(computedScale, computedScale);

    const finalX = centered ? screen.width / 2 - sprite.width / 2 : 0;
    const finalY = centered ? screen.height / 2 - sprite.height / 2 : 0;
    sprite.position.set(finalX + x, finalY + y);

    const computedOpacity = computedValue(opacity);
    sprite.alpha = computedOpacity;
  });

  return <Sprite image={image.src} ref={spriteRef} />;
}

// TODO: Gradient
function GradientLayer({ layer }: { layer: TGradientLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { gradientType, stops, colors } = layer;

  const draw = useCallback<GraphicsDrawCallback>((g) => {}, []);

  return <Graphics width={screen.width} height={screen.height} />;
}

export function PixiCanvas() {
  const { width, height } = useCanvasStore();
  const layers = useLayerStore((state) => state.layers);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        background: 0x000000,
      }}
    >
      {layers.toReversed().map((layer, index) => {
        if (layer.type === "image")
          return <ImageLayer key={index} layer={layer} />;
        if (layer.type === "gradient")
          return <GradientLayer key={index} layer={layer} />;
        return null;
      })}
    </Stage>
  );
}
