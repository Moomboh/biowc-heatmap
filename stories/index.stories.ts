import { html, TemplateResult } from 'lit';
import '../src/biowc-heatmap.js';
import { Labels, Side, SideSizes } from '../src/BiowcHeatmap.js';

const DEFAULT_DATA_SIZE = 10;

const DEFAULT_DATA: number[][] = Array.from({ length: DEFAULT_DATA_SIZE }, () =>
  Array.from({ length: DEFAULT_DATA_SIZE }, () => Math.random())
);

function generateLabels(prefix: string, times: number): string[] {
  return Array.from({ length: times }, (_, k) => prefix + k);
}

const DEFAULT_LABELS = {
  [Side.top]: generateLabels('label_', DEFAULT_DATA_SIZE),
  [Side.left]: generateLabels('label_', DEFAULT_DATA_SIZE),
  [Side.right]: generateLabels('label_', DEFAULT_DATA_SIZE),
  [Side.bottom]: generateLabels('label_', DEFAULT_DATA_SIZE),
} as Labels;

const DEFAULT_LABEL_SIZES = {
  [Side.top]: 0.3,
  [Side.left]: 0.3,
  [Side.right]: 0.3,
  [Side.bottom]: 0.3,
} as SideSizes;

export default {
  title: 'BiowcHeatmap',
  component: 'biowc-heatmap',
  argTypes: {
    data: { control: 'object', defaultValue: DEFAULT_DATA },
    labels: { control: 'object', defaultValue: DEFAULT_LABELS },
    labelSizes: { control: 'object', defaultValue: DEFAULT_LABEL_SIZES },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  data: number[][];
  labels?: Labels;
  labelSizes?: SideSizes;
}

const Template: Story<ArgTypes> = ({
  data = DEFAULT_DATA,
  labels = DEFAULT_LABELS,
  labelSizes = DEFAULT_LABEL_SIZES,
}: ArgTypes) => html`
  <biowc-heatmap
    style="max-width: 500px;"
    .data=${data}
    .labels=${labels}
    .labelSizes=${labelSizes}
  ></biowc-heatmap>
`;

export const Regular = Template.bind({});
