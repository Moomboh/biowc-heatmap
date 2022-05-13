import { html, TemplateResult } from 'lit';
import '../src/biowc-heatmap.js';
import { ColorAnnots, Dendrograms, Labels } from '../src/BiowcHeatmap.js';

const DEFAULT_COLOR = '#ff0000';

const DEFAULT_DATA = [
  [0.2, 0.6, 0.3],
  [0.1, 0.2, 0.7],
  [0.5, 0.4, 1.0],
];

const DEFAULT_LABELS = {
  top: ['T1', 'T2', 'T3'],
  left: ['L1', 'L2', 'L3'],
  right: ['R1', 'R2', 'R3'],
  bottom: ['B1', 'B2', 'B3'],
};

const DEFAULT_DENDROGRAMS = {
  top: {
    left: {
      left: 0,
      right: 1,
      height: 1,
    },
    right: 2,
    height: 2,
  },
  left: [
    {
      left: 0,
      isLeftDendrogram: false,
      right: 1,
      isRightDendrogram: false,
      height: 1,
    },
    {
      left: 0,
      isLeftDendrogram: true,
      right: 2,
      isRightDendrogram: false,
      height: 2,
    },
  ],
  right: {
    left: {
      left: 0,
      right: 1,
      height: 1,
    },
    right: 2,
    height: 2,
  },
  bottom: [
    {
      left: 0,
      isLeftDendrogram: false,
      right: 1,
      isRightDendrogram: false,
      height: 1,
    },
    {
      left: 0,
      isLeftDendrogram: true,
      right: 2,
      isRightDendrogram: false,
      height: 2,
    },
  ],
};

const DEFAULT_COLOR_ANNOTS = {
  top: ['red', 'green', 'blue'],
  left: ['red', 'green', 'blue'],
  right: ['red', 'green', 'blue'],
  bottom: ['red', 'green', 'blue'],
};

export default {
  title: 'BiowcHeatmap',
  component: 'biowc-heatmap',
  argTypes: {
    color: { control: { type: 'color' }, defaultValue: DEFAULT_COLOR },
    data: { control: 'object', defaultValue: DEFAULT_DATA },
    labels: { control: 'object', defaultValue: DEFAULT_LABELS },
    dendrograms: { control: 'object', defaultValue: DEFAULT_DENDROGRAMS },
    colorAnnots: { control: 'object', defaultValue: DEFAULT_COLOR_ANNOTS },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  color?: string;
  data: number[][];
  labels?: Labels;
  colorAnnots?: ColorAnnots;
  dendrograms?: Dendrograms;
}

const Template: Story<ArgTypes> = ({
  color = DEFAULT_COLOR,
  data = DEFAULT_DATA,
  labels = DEFAULT_LABELS,
  colorAnnots = DEFAULT_COLOR_ANNOTS,
  dendrograms = DEFAULT_DENDROGRAMS,
}: ArgTypes) => html`
  <biowc-heatmap
    style="max-width: 600px;"
    .color=${color}
    .data=${data}
    .labels=${labels}
    .colorAnnots=${colorAnnots}
    .dendrograms=${dendrograms}
  ></biowc-heatmap>
`;

export const AllFeatures = Template.bind({});
