/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stage, Sprite, useTick, useApp, Graphics } from "@pixi/react";
import { Sprite as PSprite, Graphics as PGraphics } from "pixi.js";
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
import { GradientTexture } from "../three/PixiGradientTexture";

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

// TODO: effects + maybe zoom
function ImageLayer({ layer }: { layer: TImageLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { image, width, height, x, y, scale, opacity, centered } = layer;

  const spriteRef = useRef<PSprite>(null);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const wScale = width / image.width;
    const hScale = height / image.height;

    const computedScale = computedValue(scale);
    sprite.scale.set(computedScale * wScale, computedScale * hScale);

    const finalX = centered ? screen.width / 2 - sprite.width / 2 : 0;
    const finalY = centered ? screen.height / 2 - sprite.height / 2 : 0;
    sprite.position.set(finalX + x, finalY + y);

    const computedOpacity = computedValue(opacity);
    sprite.alpha = computedOpacity;
  });

  return <Sprite image={image.src} ref={spriteRef} />;
}

// TODO: zoom, effects
function GradientLayer({ layer }: { layer: TGradientLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { gradientType, scale, stops, colors, centered } = layer;

  const graphicsRef = useRef<PGraphics>(null);

  useTick(() => {
    const graphics = graphicsRef.current;
    if (!graphics) return;

    const computedScale = computedValue(scale);
    graphics.scale.set(computedScale, computedScale);

    const finalX = centered ? screen.width / 2 - graphics.width / 2 : 0;
    const finalY = centered ? screen.height / 2 - graphics.height / 2 : 0;
    graphics.position.set(finalX, finalY);

    const opacity = computedValue(layer.opacity);
    graphics.alpha = opacity;
  });

  const draw = useCallback<GraphicsDrawCallback>(
    (g) => {
      g.clear();
      g.beginTextureFill({
        texture: GradientTexture({
          stops,
          colors,
          type: gradientType,
          width: screen.width,
          height: screen.height,
        }),
      });
      g.drawRect(0, 0, screen.width, screen.height);
    },
    [colors, gradientType, screen.height, screen.width, stops],
  );

  return (
    <Graphics
      ref={graphicsRef}
      width={screen.width}
      height={screen.height}
      draw={draw}
    />
  );
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
