import { binarySearchUpperBound } from './binarySearchUpperBound.js';

export type RgbValues = [number, number, number];

export type ColorScaleConfig = {
  colors: string[];
  values: number[];
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

function validateColorScaleConfig(config: ColorScaleConfig): void {
  const { colors, values } = config;
  const errorMessage = (message: string) =>
    `Invalid color scale config: ${message}: ${JSON.stringify(config)}`;

  for (const color of colors) {
    if (!color.startsWith('rgb(') && !color.startsWith('#')) {
      throw new Error(errorMessage(`color must be in rgb() or hex format`));
    }
  }

  if (values.length !== colors.length) {
    throw new Error(
      errorMessage(`colors and values must have the same length`)
    );
  }

  let lastValue = -Infinity;
  for (const value of values) {
    if (value < lastValue) {
      throw new Error(errorMessage('values must be in ascending order'));
    }
    lastValue = value;
  }
}

export const colorScale: (
  colorConfig: string | ColorScaleConfig
) => (value: number) => string = (colorConfig: string | ColorScaleConfig) => {
  const colorScaleConfig =
    typeof colorConfig === 'string'
      ? {
          colors: ['rgb(255,255,255)', colorConfig],
          values: [0, 1],
        }
      : colorConfig;

  validateColorScaleConfig(colorScaleConfig);

  const { colors, values: colorValues } = colorScaleConfig;

  const rgbValues = colors.map(c =>
    c.startsWith('rgb(') ? rgbStringToRgbValues(c) : hexStringToRgbValues(c)
  );

  return (value: number) => {
    const i = binarySearchUpperBound(colorValues, x => x > value);

    if (i === 0) {
      return colors[0];
    }

    if (i === colors.length) {
      return colors[colors.length - 1];
    }

    // calculate the intermediate color between `rgbValues[i - 1]` and `rgbValues[i]`
    // corresponding to `value`
    const relativeValue =
      (value - colorValues[i - 1]) / (colorValues[i] - colorValues[i - 1]);
    const [r, g, b] = rgbValues[i - 1].map((v, j) =>
      Math.round(v * (1 - relativeValue) + relativeValue * rgbValues[i][j])
    );

    return `rgb(${r}, ${g}, ${b})`;
  };
};
