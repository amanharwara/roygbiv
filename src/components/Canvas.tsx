import { Stage, Sprite, useTick, useApp } from "@pixi/react";
import { Sprite as PSprite, Filter, Container } from "pixi.js";
import { useCanvasStore } from "../stores/canvas";
import {
  useLayerStore,
  ImageLayer as TImageLayer,
  GradientLayer as TGradientLayer,
  ComputedProperty,
  isComputedProperty,
  Layer,
} from "../stores/layers";
import { audioStore, getRangeValue } from "../stores/audio";
import { RefObject, useEffect, useId, useRef } from "react";
import { createGradientTexture } from "../textures/GradientTexture";
import { ValueComputer } from "../utils/computedValue";
import { EffectsRegistry } from "../stores/effects";

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
  effects: Layer["effects"];
}) {
  const filtersMapRef = useRef<Map<string, Filter>>(new Map());

  useTick(() => {
    if (!containerRef.current) return;

    const filtersMap = filtersMapRef.current;

    for (const filterID of filtersMap.keys()) {
      if (effects.findIndex((effect) => effect.id === filterID) === -1) {
        filtersMap.delete(filterID);
      }
    }

    for (const effect of effects) {
      const Filter = EffectsRegistry.getFilterForType(effect.type);
      if (!Filter) {
        throw new Error("Unregistered effect added");
      }
      const effectID = effect.id;
      const existingFilter = filtersMap.get(effectID);
      if (existingFilter && !effect.enabled) {
        filtersMap.delete(effectID);
      }
      let filter = existingFilter;
      if (!filter) {
        filter = new Filter();
        filtersMap.set(effectID, filter);
      }
      for (const key in effect) {
        if (key in filter) {
          const value = effect[key as keyof typeof effect];
          if (isComputedProperty(value)) {
            // @ts-expect-error key
            filter[key] = valueComputer.compute(
              value,
              // @ts-expect-error key
              filter[key],
            );
          } else {
            // @ts-expect-error key
            filter[key] = value;
          }
        }
      }
    }

    containerRef.current.filters = Array.from(filtersMap.values());
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
