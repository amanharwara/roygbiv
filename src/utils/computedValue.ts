import { QuickJSContext } from "quickjs-emscripten";
import { ComputedProperty } from "../stores/layers";
import { lerp as lerpUtil, mapNumber } from "./numbers";
import { loadQuickJS } from "./quickjs";
import { audioElement } from "../audio/context";

export class ValueComputer {
  context: QuickJSContext | undefined;

  constructor(
    private getVolume: () => number,
    private getFreqValue: (name: string) => number,
    private map: typeof mapNumber = mapNumber,
    private lerp: typeof lerpUtil = lerpUtil,
  ) {
    void this.init();
  }

  async init() {
    const module = await loadQuickJS();
    const context = module.newContext();

    const getVolumeFnHandle = context.newFunction("volume", () => {
      return context.newNumber(this.getVolume());
    });
    context.setProp(context.global, "volume", getVolumeFnHandle);
    getVolumeFnHandle.dispose();

    const getFreqValueFnHandle = context.newFunction(
      "getFreqValue",
      (nameHandle) => {
        const name = context.getString(nameHandle);
        const value = this.getFreqValue(name);
        return context.newNumber(value);
      },
    );
    context.setProp(context.global, "freq", getFreqValueFnHandle);
    getFreqValueFnHandle.dispose();

    const mapFnHandle = context.newFunction(
      "map",
      (number, start1, stop1, start2, stop2) => {
        const n = context.getNumber(number);
        const s1 = context.getNumber(start1);
        const s2 = context.getNumber(stop1);
        const s3 = context.getNumber(start2);
        const s4 = context.getNumber(stop2);
        return context.newNumber(this.map(n, s1, s2, s3, s4));
      },
    );
    context.setProp(context.global, "map", mapFnHandle);
    mapFnHandle.dispose();

    const lerpFnHandle = context.newFunction("lerp", (start, end, amount) => {
      const s = context.getNumber(start);
      const e = context.getNumber(end);
      const a = context.getNumber(amount);
      return context.newNumber(this.lerp(s, e, a));
    });
    context.setProp(context.global, "lerp", lerpFnHandle);
    lerpFnHandle.dispose();

    const timeFnHandle = context.newFunction("time", () => {
      return context.newNumber(audioElement.currentTime);
    });
    context.setProp(context.global, "time", timeFnHandle);
    timeFnHandle.dispose();

    const durationFnHandle = context.newFunction("duration", () => {
      return context.newNumber(audioElement.duration);
    });
    context.setProp(context.global, "duration", durationFnHandle);
    durationFnHandle.dispose();

    this.context = context;
  }

  compute(property: ComputedProperty, prevValue?: number) {
    if (!this.context) {
      return property.default;
    }
    try {
      let prev = prevValue;
      if (prev === undefined || isNaN(prev)) {
        prev = 0;
      }
      const replace = property.value.replace(/\bprev\b/g, prev.toString());
      const evaluated = this.context.unwrapResult(
        this.context.evalCode(replace, undefined, {
          type: "global",
        }),
      );
      let result = this.context.getNumber(evaluated);
      evaluated.dispose();
      if (isNaN(result)) {
        return property.default;
      }
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
}

export const createComputedProperty = (
  defaultValue: number,
  min?: number,
  max?: number,
): ComputedProperty => ({
  default: defaultValue,
  value: defaultValue.toString(),
  min,
  max,
});
