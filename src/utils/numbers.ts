/**
 * Constrains a number between a minimum and maximum value.
 */
export function constrainNumber(number: number, low: number, high: number) {
  return Math.max(Math.min(number, high), low);
}

/**
 * Re-maps a number from one range to another.
 *
 * For example, calling `map(2, 0, 10, 0, 100)` returns 20. The first three
 * arguments set the original value to 2 and the original range from 0 to 10.
 * The last two arguments set the target range from 0 to 100. 20's position
 * in the target range [0, 100] is proportional to 2's position in the
 * original range [0, 10].
 */
export function mapNumber(
  number: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  withinBounds: boolean = true,
) {
  const newval =
    ((number - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrainNumber(newval, start2, stop2);
  } else {
    return constrainNumber(newval, stop2, start2);
  }
}
