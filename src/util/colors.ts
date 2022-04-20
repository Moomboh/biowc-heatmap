export type RgbValues = [number, number, number];

type ColorScaleCache = {
  [value: number]: string;
};

type ColorScaleCaches = {
  [key: string]: ColorScaleCache;
};

export function rgbStringToRgbValues(color: string): RgbValues {
  const rgb = color.replace(' ', '').replace('rgb(', '').replace(')', '');
  const rgbValues = rgb.split(',').map(value => parseInt(value, 10));

  if (rgbValues.length !== 3) {
    throw new Error(`Invalid color: ${color}`);
  }

  return rgbValues as RgbValues;
}

export function hexStringToRgbValues(color: string): RgbValues {
  const hex = color.replace('#', '');
  const rgbValues = hex.match(/.{2}/g)?.map(value => parseInt(value, 16));

  if (rgbValues?.length !== 3) {
    throw new Error(`Invalid color: ${color}`);
  }

  return rgbValues as RgbValues;
}

const caches = {} as ColorScaleCaches;

export const colorScale: (color: string) => (value: number) => string = (
  color: string
) => {
  if (!color.startsWith('rgb(') && !color.startsWith('#')) {
    throw new Error('color must be in rgb() or hex format');
  }

  const rgbValues = color.startsWith('rgb(')
    ? rgbStringToRgbValues(color)
    : hexStringToRgbValues(color);

  if (!(color in caches)) {
    caches[color] = {};
  }

  return (value: number) => {
    if (value in caches[color]) {
      return caches[color][value];
    }

    if (value > 1 || value < 0) {
      throw new Error('value must be between 0 and 1');
    }

    const [r, g, b] = rgbValues.map(v => v * value + (1 - value) * 255);
    const result = `rgb(${r}, ${g}, ${b})`;

    caches[color][value] = result;
    return result;
  };
};
