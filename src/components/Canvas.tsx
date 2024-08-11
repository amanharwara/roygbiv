import { Stage, Sprite, useTick, useApp } from "@pixi/react";
import { Sprite as PSprite, NoiseFilter, Filter, Container } from "pixi.js";
import { AsciiFilter, CRTFilter } from "pixi-filters";
import { useCanvasStore } from "../stores/canvas";
import {
  useLayerStore,
  ImageLayer as TImageLayer,
  GradientLayer as TGradientLayer,
  PlaneLayer,
  ComputedProperty,
} from "../stores/layers";
import { audioStore, getRangeValue } from "../stores/audio";
import { RefObject, useEffect, useId, useRef } from "react";
import { createGradientTexture } from "../textures/GradientTexture";
import { ValueComputer } from "../utils/computedValue";

const valueComputer = new ValueComputer(
  () => audioStore.getState().level,
  getRangeValue,
);

function scaleContainer(
  container: Container,
  width: number,
  height: number,
  scale: ComputedProperty,
  base: { width: number; height: number },
) {
  const wScale = width / base.width;
  const hScale = height / base.height;
  const computedScale = valueComputer.compute(scale, container.scale.x);
  container.scale.set(computedScale * wScale, computedScale * hScale);
}

function positionContainer(
  container: Container,
  x: ComputedProperty,
  y: ComputedProperty,
  centered: boolean,
  base: { width: number; height: number },
) {
  const finalX = centered ? base.width / 2 - container.width / 2 : 0;
  const finalY = centered ? base.height / 2 - container.height / 2 : 0;
  const computedX = valueComputer.compute(x);
  const computedY = valueComputer.compute(y);
  container.position.set(finalX + computedX, finalY + computedY);
}

function setContainerOpacity(container: Container, opacity: ComputedProperty) {
  const computedOpacity = valueComputer.compute(opacity);
  container.alpha = computedOpacity;
}

function useEffects({
  containerRef,
  effects,
}: {
  containerRef: RefObject<Container>;
  effects: PlaneLayer["effects"];
}) {
  const { noise, ascii, crt } = effects;

  const noiseEffect = useRef(new NoiseFilter(noise.amount.default));
  const asciiEffect = useRef(new AsciiFilter(ascii.size.default));
  const crtEffect = useRef(
    new CRTFilter({
      curvature: 1,
      lineWidth: 3,
      lineContrast: 0.3,
      noise: 0.2,
      noiseSize: 1,
      vignetting: 0.3,
      vignettingAlpha: 1,
      vignettingBlur: 0.3,
      seed: 0,
      time: 0.5,
    }),
  );

  const filters = useRef<Filter[]>([]);

  useTick(() => {
    if (!containerRef.current) return;

    noiseEffect.current.noise = valueComputer.compute(
      noise.amount,
      noiseEffect.current.noise,
    );

    asciiEffect.current.size = valueComputer.compute(
      ascii.size,
      asciiEffect.current.size,
    );

    crtEffect.current.curvature = valueComputer.compute(
      crt.curvature,
      crtEffect.current.curvature,
    );
    crtEffect.current.lineWidth = valueComputer.compute(
      crt.lineWidth,
      crtEffect.current.lineWidth,
    );
    crtEffect.current.lineContrast = valueComputer.compute(
      crt.lineContrast,
      crtEffect.current.lineContrast,
    );
    crtEffect.current.noise = valueComputer.compute(
      crt.noise,
      crtEffect.current.noise,
    );
    crtEffect.current.noiseSize = valueComputer.compute(
      crt.noiseSize,
      crtEffect.current.noiseSize,
    );
    crtEffect.current.vignetting = valueComputer.compute(
      crt.vignetting,
      crtEffect.current.vignetting,
    );
    crtEffect.current.vignettingAlpha = valueComputer.compute(
      crt.vignettingAlpha,
      crtEffect.current.vignettingAlpha,
    );
    crtEffect.current.vignettingBlur = valueComputer.compute(
      crt.vignettingBlur,
      crtEffect.current.vignettingBlur,
    );
    crtEffect.current.seed = valueComputer.compute(
      crt.seed,
      crtEffect.current.seed,
    );
    crtEffect.current.time = valueComputer.compute(
      crt.time,
      crtEffect.current.time,
    );

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

    if (crt.enabled) {
      if (!filters.current.includes(crtEffect.current))
        filters.current.push(crtEffect.current);
    } else {
      const index = filters.current.indexOf(crtEffect.current);
      if (index !== -1) filters.current.splice(index, 1);
    }

    containerRef.current.filters = filters.current;
  });
}

function ImageLayer({ layer }: { layer: TImageLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const { image, width, height, x, y, scale, opacity, centered, effects } =
    layer;

  const spriteRef = useRef<PSprite>(null);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    scaleContainer(sprite, width, height, scale, image);
    positionContainer(sprite, x, y, centered, screen);
    setContainerOpacity(sprite, opacity);
  });

  useEffects({ containerRef: spriteRef, effects });

  return <Sprite image={image.src} ref={spriteRef} />;
}

function GradientLayer({ layer }: { layer: TGradientLayer }) {
  const pixiApp = useApp();
  const { screen } = pixiApp;

  const {
    gradientType,
    width,
    height,
    x,
    y,
    scale,
    useDynamicStops,
    stops,
    dynamicStops,
    colors,
    centered,
    effects,
  } = layer;

  const id = useId();

  const textureRef = useRef(
    createGradientTexture({
      id,
      stops: useDynamicStops
        ? dynamicStops.map((stop) => valueComputer.compute(stop))
        : stops,
      colors,
      type: gradientType,
      width: screen.width,
      height: screen.height,
    }),
  );
  useEffect(() => {
    const texture = textureRef.current;
    return () => {
      texture.destroy();
    };
  }, []);

  const spriteRef = useRef<PSprite>(null);

  const previouslyCalculatedDynamicStops = useRef<number[]>([]);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    scaleContainer(sprite, width, height, scale, screen);
    positionContainer(sprite, x, y, centered, screen);
    setContainerOpacity(sprite, layer.opacity);

    if (useDynamicStops) {
      const newStops = dynamicStops.map((stop, index) =>
        valueComputer.compute(
          stop,
          previouslyCalculatedDynamicStops.current[index],
        ),
      );
      previouslyCalculatedDynamicStops.current = newStops;
      textureRef.current.update({
        stops: newStops,
        colors,
        type: gradientType,
      });
    }
  });

  useEffects({ containerRef: spriteRef, effects });

  return <Sprite ref={spriteRef} texture={textureRef.current.texture} />;
}

export function Canvas() {
  const { width, height, setPixiApp, isRendering } = useCanvasStore();
  const layers = useLayerStore((state) => state.layers);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        background: 0x000000,
      }}
      onMount={setPixiApp}
      raf={!isRendering}
      renderOnComponentChange={isRendering}
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
