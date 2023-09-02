export const getRandomColor = (): string => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 100);
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export const getRandomColors = (count: number): string[] => {
  count = Math.max(count, 2);
  const colors = new Set<string>();
  while (colors.size < count) {
    colors.add(getRandomColor());
  }
  return [...colors];
};

export const getStopsForGradientColors = (colors: string[]): number[] => {
  const multiplier = 1 / (colors.length - 1);
  return new Array(colors.length).fill(0).map((_, i) => {
    return i * multiplier;
  });
};
