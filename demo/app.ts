import { html, render } from 'lit';
import '../src/biowc-heatmap.js';
import { fetchDemoData } from './demoData.js';
import { BiowcHeatmap } from '../src/BiowcHeatmap.js';

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

const heatmap = document.querySelector('biowc-heatmap') as BiowcHeatmap;
const zoomInButton = document.querySelector('#zoom-in');
const zoomOutButton = document.querySelector('#zoom-out');

zoomInButton?.addEventListener('click', () => {
  heatmap.zoomX += 0.5;
  heatmap.zoomY += 0.5;
});

zoomOutButton?.addEventListener('click', () => {
  heatmap.zoomX += 0.5;
  heatmap.zoomY += 0.5;
});
