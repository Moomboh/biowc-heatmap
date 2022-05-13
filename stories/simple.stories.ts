import { html, TemplateResult } from 'lit';
import '../src/biowc-heatmap.js';
import { Labels, Side, SideNumbers } from '../src/BiowcHeatmap.js';

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
} as Labels;

export default {
  title: 'BiowcHeatmap',
  component: 'biowc-heatmap',
  argTypes: {
    data: { control: 'object', defaultValue: DEFAULT_DATA },
    labels: { control: 'object', defaultValue: DEFAULT_LABELS },
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
  labelSizes?: SideNumbers;
}

const Template: Story<ArgTypes> = ({
  data = DEFAULT_DATA,
  labels = DEFAULT_LABELS,
}: ArgTypes) => html`
  <biowc-heatmap
    style="max-width: 600px;"
    .data=${data}
    .labels=${labels}
  ></biowc-heatmap>
`;

export const Simple = Template.bind({});
