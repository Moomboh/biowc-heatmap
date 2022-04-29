import { html, render } from 'lit';
import '../src/biowc-heatmap.js';
import { fetchDemoData } from './demoData.js';

const demoData = await fetchDemoData();

render(
  html`
    <biowc-heatmap
        .data=${demoData.data}
        .labels=${{
          top: demoData.xLabels,
          left: demoData.yLabels,
          right: demoData.yLabels,
          bottom: demoData.xLabels,
        }}
        .dendrograms=${{
          top: demoData.xDendrogram,
          left: demoData.yDendrogram,
          right: demoData.yDendrogram,
          bottom: demoData.xDendrogram,
        }}
    ></biowc-heatmap>
    `,
  document.querySelector('#demo') as HTMLElement
);
