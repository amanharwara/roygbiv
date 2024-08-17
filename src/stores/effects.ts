import { nanoid } from "nanoid";
import { AsciiFilter, CRTFilter } from "pixi-filters";
import { Filter, NoiseFilter } from "pixi.js";
import { ComputedProperty } from "./layers";
import { createComputedProperty } from "../utils/computedValue";

type EffectProperty = {
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
  properties: Record<string, EffectProperty>;
};

export const EffectsRegistry = {
  registeredEffects: new Map<string, RegisteredEffect>(),
  getNameForType(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) throw new Error("Effect not registered");
    return effect.name;
  },
  getFilterForType(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) throw new Error("Effect not registered");
    return effect.filter;
  },
  getPropertiesForType(type: string) {
    const effect = this.registeredEffects.get(type);
    if (!effect) throw new Error("Effect not registered");
    return effect.properties;
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
    for (const [key, property] of Object.entries(effect.properties)) {
      if (property.type === "boolean") {
        layerEffect[key] = property.default;
      }
      if (property.type === "computed") {
        layerEffect[key] = createComputedProperty(
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
  properties: {
    amount: {
      label: "Amount",
      type: "computed",
      default: 0.5,
      min: 0,
      max: 1,
    },
    seed: { label: "Seed", type: "computed", default: Math.random() },
  },
});
EffectsRegistry.registerEffect("ascii", {
  name: "ASCII",
  filter: AsciiFilter,
  properties: {
    size: {
      label: "Size",
      type: "computed",
      default: 10,
      min: 2,
      max: 20,
    },
  },
});
EffectsRegistry.registerEffect("crt", {
  name: "CRT",
  filter: CRTFilter,
  properties: {
    curvature: {
      label: "Curvature",
      type: "computed",
      default: 1,
      min: 0,
      max: 10,
    },
    lineWidth: {
      label: "Line width",
      type: "computed",
      default: 3,
      min: 0,
      max: 5,
    },
    lineContrast: {
      label: "Line contrast",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    noise: { label: "Noise", type: "computed", default: 0.2, min: 0, max: 1 },
    noiseSize: {
      label: "Noise size",
      type: "computed",
      default: 1,
      min: 1,
      max: 10,
    },
    vignetting: {
      label: "Vignetting",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    vignettingAlpha: {
      label: "Vignetting alpha",
      type: "computed",
      default: 1,
      min: 0,
      max: 1,
    },
    vignettingBlur: {
      label: "Vignetting blur",
      type: "computed",
      default: 0.3,
      min: 0,
      max: 1,
    },
    seed: { label: "Seed", type: "computed", default: 0 },
    time: { label: "Time", type: "computed", default: 0.5 },
  },
});

export type LayerEffect = {
  enabled: boolean;
  id: string;
  type: string;
} & Record<string, string | ComputedProperty | boolean>;
