import { ComputedProperty } from "../stores/layers";
import { lerp as lerpUtil, mapNumber } from "./numbers";

export class ValueComputer {
  constructor(
    private getVolume: () => number,
    private getFreqValue: (name: string) => number,
    private map: typeof mapNumber = mapNumber,
    private lerp: typeof lerpUtil = lerpUtil,
  ) {}

  compute(property: ComputedProperty, prevValue?: number) {
    try {
      // Called because used as value in eval
      const volume = this.getVolume();
      // Passed as reference because used as function in eval
      const map = this.map;
      const freq = this.getFreqValue;
      const lerp = this.lerp;
      let prev = prevValue;
      if (prev === undefined || isNaN(prev)) {
        prev = 0;
      }
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
}
