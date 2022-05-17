/**
 * Return `0 <= i <= array.length` such that `!pred(array[i - 1]) && pred(array[i])`.
 * If the predicate is false everywhere, array.length is returned
 *
 * Source: https://stackoverflow.com/a/41956372
 */
export function binarySearchUpperBound<T>(
  array: T[],
  pred: (x: T) => boolean
): number {
  let lo = -1;
  let hi = array.length;

  while (1 + lo < hi) {
    // eslint-disable-next-line no-bitwise
    const mi = lo + ((hi - lo) >> 1);
    if (pred(array[mi])) {
      hi = mi;
    } else {
      lo = mi;
    }
  }

  return hi;
}
