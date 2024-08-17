import { nanoid } from "nanoid";
import { AsciiFilter, CRTFilter, PixelateFilter } from "pixi-filters";
import { Filter, NoiseFilter } from "pixi.js";
import { ComputedProperty } from "./layers";
import { createComputedProperty } from "../utils/computedValue";

type EffectProperty = {
  key: string;
  label: string;
} & (
  | {
      type: "boolean";
      default: boolean;
    }
  | {
      type: "computed";
      default: number;
      min?: number;
      max?: number;
    }
);

type RegisteredEffect = {
  name: string;
  filter: new () => Filter;
  properties: EffectProperty[];
};

export const EffectsRegistry = {
  registeredEffects: new Map<string, RegisteredEffect>(),
  getFilterForType(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) throw new Error("Effect not registered");
    return effect.filter;
  },
  getEffectForType(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) throw new Error("Effect not registered");
    return effect;
  },
  createLayerEffect(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) {
      throw new Error("Effect not registered");
    }
    const layerEffect: LayerEffect = {
      type,
      enabled: true,
      id: nanoid(),
    };
    for (const property of effect.properties) {
      if (property.type === "boolean") {
        layerEffect[property.key] = property.default;
      }
      if (property.type === "computed") {
        layerEffect[property.key] = createComputedProperty(
          property.default,
          property.min,
          property.max,
        );
      }
    }
    return layerEffect;
  },
  registerEffect(type: string, effect: RegisteredEffect) {
    this.registeredEffects.set(type, effect);
  },
};

EffectsRegistry.registerEffect("noise", {
  name: "Noise",
  filter: NoiseFilter,
  properties: [
    {
      key: "amount",
      label: "Amount",
      type: "computed",
      default: 0.5,
      min: 0,
      max: 1,
    },
    {
      key: "seed",
      label: "Seed",
      type: "computed",
      default: Math.random(),
    },
  ],
});
EffectsRegistry.registerEffect("ascii", {
  name: "ASCII",
  filter: AsciiFilter,
  properties: [
    {
      key: "size",
      label: "Size",
      type: "computed",
      default: 10,
      min: 2,
      max: 20,
    },
  ],
});
EffectsRegistry.registerEffect("crt", {
  name: "CRT",
  filter: CRTFilter,
  properties: [
    {
      key: "curvature",
      label: "Curvature",
      type: "computed",
      default: 1,
      min: 0,
      max: 10,
    },
    {
      key: "lineWidth",
      label: "Line width",
      type: "computed",
      default: 3,
      min: 0,
      max: 5,
    },
    {
      key: "lineContrast",
      label: "Line contrast",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    {
      key: "verticalLine",
      label: "Vertical lines",
      type: "boolean",
      default: false,
    },
    {
      key: "noise",
      label: "Noise",
      type: "computed",
      default: 0.2,
      min: 0,
      max: 1,
    },
    {
      key: "noiseSize",
      label: "Noise size",
      type: "computed",
      default: 1,
      min: 1,
      max: 10,
    },
    {
      key: "vignetting",
      label: "Vignetting",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    {
      key: "vignettingAlpha",
      label: "Vignetting alpha",
      type: "computed",
      default: 1,
      min: 0,
      max: 1,
    },
    {
      key: "vignettingBlur",
      label: "Vignetting blur",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    { key: "seed", label: "Seed", type: "computed", default: 0 },
    { key: "time", label: "Time", type: "computed", default: 0.5 },
  ],
});
EffectsRegistry.registerEffect("pixelate", {
  name: "Pixelate",
  filter: PixelateFilter,
  properties: [
    {
      key: "size",
      label: "Pixel size",
      type: "computed",
      default: 10,
      min: 4,
      max: 40,
    },
  ],
});

export type LayerEffect = {
  enabled: boolean;
  id: string;
  type: string;
} & Record<string, string | ComputedProperty | boolean>;
