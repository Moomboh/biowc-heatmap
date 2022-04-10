import { html, TemplateResult } from 'lit';
import '../src/biowc-heatmap.js';

const DEFAULT_DATA = [
  [0.1, 0.3, 0.5],
  [0.2, 1.0, 0.9],
  [0.4, 0.7, 0.2],
];

export default {
  title: 'BiowcHeatmap',
  component: 'biowc-heatmap',
  argTypes: {
    data: { control: 'object', defaultValue: DEFAULT_DATA },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  data?: Array<Array<number>>;
}

const Template: Story<ArgTypes> = ({ data = DEFAULT_DATA }: ArgTypes) => html`
  <biowc-heatmap style="max-width: 500px;" .data=${data}></biowc-heatmap>
`;

export const Regular = Template.bind({});
