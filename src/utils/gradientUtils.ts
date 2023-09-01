export const getStopsForGradientColors = (colors: string[]): number[] => {
  const multiplier = 1 / (colors.length - 1);
  return new Array(colors.length).fill(0).map((_, i) => {
    return i * multiplier;
  });
};
