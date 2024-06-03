import { ComputedProperty } from "../stores/layers";

export function getRandomColor(): string {
  const h = Math.floor(Math.random() * 360) + 1;
  const s = Math.floor(Math.random() * 100) + 1;
  const l = Math.min(Math.floor(Math.random() * 100) + 1, 50);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getRandomColors(count: number): string[] {
  count = Math.max(count, 2);
  const colors = new Set<string>();
  while (colors.size < count) {
    colors.add(getRandomColor());
  }
  return [...colors];
}

export function getStopsForGradientColors(colors: string[]): number[] {
  const multiplier = 1 / (colors.length - 1);
  return new Array(colors.length).fill(0).map((_, i) => {
    return i * multiplier;
  });
}

export function getDynamicStopsForGradientColors(
  colors: string[],
): ComputedProperty[] {
  const multiplier = 1 / (colors.length - 1);
  return new Array(colors.length).fill(0).map((_, i) => {
    return {
      default: i * multiplier,
      value: `${i * multiplier}`,
      min: 0,
      max: 1,
    };
  });
}
