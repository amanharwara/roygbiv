const randomColors = [
  "hsl(0, 0%, 0%)",
  "hsl(180, 100%, 50%)",
  "hsl(330, 100%, 50%)",
];

export const getRandomColor = (): string => {
  return randomColors[Math.floor(Math.random() * randomColors.length)]!;
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
