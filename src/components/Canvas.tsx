/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stage, Sprite, useTick, useApp, Graphics } from "@pixi/react";
import {
  Sprite as PSprite,
  Graphics as PGraphics,
  NoiseFilter,
  Filter,
  Container,
} from "pixi.js";
import { AsciiFilter } from "pixi-filters";
import { useCanvasStore } from "../stores/canvas";
import {
  ComputedProperty,
  useLayerStore,
  ImageLayer as TImageLayer,
  GradientLayer as TGradientLayer,
  PlaneLayer,
} from "../stores/layers";
import { audioElement, isAudioPaused } from "../audio/context";
import { audioStore, getRangeValue } from "../stores/audio";
import { mapNumber, getRandomNumber, lerp as lerpUtil } from "../utils/numbers";
import { ComponentProps, RefObject, useCallback, useRef } from "react";
import { GradientTexture } from "../textures/GradientTexture";

type GraphicsDrawCallback = NonNullable<
  ComponentProps<typeof Graphics>["draw"]
>;

function computedValue(property: ComputedProperty, prevValue?: number) {
  try {
    // Declaring variables so they can be used in eval
    const volume = audioStore.getState().level;
    const time = audioElement.currentTime;
    const map = mapNumber;
    const random = isAudioPaused() ? () => 0 : getRandomNumber;
    const fRange = getRangeValue;
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

// TODO REFACTOR: make property setting and effects more composable
// so that the logic can be defined once and reused for both layers

function useEffects({
  containerRef,
  effects,
}: {
  containerRef: RefObject<Container>;
  effects: PlaneLayer["effects"];
}) {
  const { noise, ascii } = effects;

  const noiseEffect = useRef(new NoiseFilter(noise.amount.default));
  const asciiEffect = useRef(new AsciiFilter(ascii.size.default));

  const filters = useRef<Filter[]>([]);

  useTick(() => {
    if (!containerRef.current) return;

    noiseEffect.current.noise = computedValue(noise.amount);
    asciiEffect.current.size = computedValue(ascii.size);

    if (noise.enabled) {
      if (!filters.current.includes(noiseEffect.current))
        filters.current.push(noiseEffect.current);
    } else {
      const index = filters.current.indexOf(noiseEffect.current);
      if (index !== -1) filters.current.splice(index, 1);
    }
    if (ascii.enabled) {
      if (!filters.current.includes(asciiEffect.current))
        filters.current.push(asciiEffect.current);
    } else {
      const index = filters.current.indexOf(asciiEffect.current);
      if (index !== -1) filters.current.splice(index, 1);
    }

    containerRef.current.filters = filters.current;
  });
}

// TODO: effects + maybe zoom
function ImageLayer({ layer }: { layer: TImageLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { image, width, height, x, y, scale, opacity, centered, effects } =
    layer;

  const spriteRef = useRef<PSprite>(null);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const wScale = width / image.width;
    const hScale = height / image.height;

    const computedScale = computedValue(scale, sprite.scale.x);
    sprite.scale.set(computedScale * wScale, computedScale * hScale);

    const finalX = centered ? screen.width / 2 - sprite.width / 2 : 0;
    const finalY = centered ? screen.height / 2 - sprite.height / 2 : 0;
    sprite.position.set(finalX + x, finalY + y);

    const computedOpacity = computedValue(opacity);
    sprite.alpha = computedOpacity;
  });

  useEffects({ containerRef: spriteRef, effects });

  return <Sprite image={image.src} ref={spriteRef} />;
}

// TODO: zoom, effects
function GradientLayer({ layer }: { layer: TGradientLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { gradientType, scale, stops, colors, centered, effects } = layer;

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

  useEffects({ containerRef: graphicsRef, effects });

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

export function Canvas() {
  const { width, height } = useCanvasStore();
  const layers = useLayerStore((state) => state.layers);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        background: 0x000000,
      }}
      onMount={(app) => {
        app.ticker.maxFPS = 60;
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
