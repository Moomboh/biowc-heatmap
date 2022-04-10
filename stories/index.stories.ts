import { html, TemplateResult } from 'lit';
import '../src/advanced-heatmap.js';

const DEFAULT_DATA = [
  [0.1, 0.3, 0.5],
  [0.2, 1.0, 0.9],
  [0.4, 0.7, 0.2],
];

export default {
  title: 'AdvancedHeatmap',
  component: 'advanced-heatmap',
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
  <advanced-heatmap style="max-width: 500px;" .data=${data}></advanced-heatmap>
`;

export const Regular = Template.bind({});
