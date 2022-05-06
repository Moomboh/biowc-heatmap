import { html, render } from 'lit';
import '../src/biowc-heatmap.js';
import { BiowcHeatmap } from '../src/BiowcHeatmap.js';
import { fetchDemoData, DemoData } from './demoData.js';

const SMALL_DATASET_URL =
  'https://www.proteomicsdb.org/proteomicsdb/logic/getExpressionProfileHeatmapCluster.xsjs?proteins=insulin&quantification=MS1&customQuantification=&biologicalSource=tissue%3Bfluid&calculationMethod=iBAQ&customCalculationMethod=&swissprotOnly=1&noIsoforms=1&omics=Proteomics&source=db&uuid=&datasetIds=&impute=0&taxcode=9606';

const MEDIUM_DATASET_URL =
  'https://www.proteomicsdb.org/proteomicsdb/logic/getExpressionProfileHeatmapCluster.xsjs?proteins=insulin;egfr;kinase;polymerase&quantification=MS1&customQuantification=&biologicalSource=tissue%3Bfluid&calculationMethod=iBAQ&customCalculationMethod=&swissprotOnly=1&noIsoforms=1&omics=Proteomics&source=db&uuid=&datasetIds=&impute=0&taxcode=9606';

const LARGE_DATASET_URL =
  'https://www.proteomicsdb.org/proteomicsdb/logic/getExpressionProfileHeatmapCluster.xsjs?proteins=insulin%3Bkinase&quantification=MS1&customQuantification=&biologicalSource=tissue%3Bfluid%3Bcell+line&calculationMethod=iBAQ&customCalculationMethod=&swissprotOnly=1&noIsoforms=1&omics=Proteomics&source=db&uuid=&datasetIds=&impute=0&taxcode=9606';

function renderHeatmap(demoData: DemoData) {
  const heatmapContainer = document.querySelector(
    '#heatmap-container'
  ) as HTMLElement;

  render(
    html`
    <biowc-heatmap
        id="heatmap"
        .data=${demoData.data}
        .labels=${{
          top: demoData.xLabels,
          left: demoData.yLabels,
        }}
        .dendrograms=${{
          top: demoData.xDendrogram,
          left: demoData.yDendrogram,
        }}
        .colorAnnots=${{
          top: demoData.xAnnotColors,
          bottom: demoData.xAnnotColors,
        }}
    ></biowc-heatmap>
    `,
    heatmapContainer
  );
}

function renderLoading() {
  const heatmapContainer = document.querySelector(
    '#heatmap-container'
  ) as HTMLElement;

  render(
    html`
    <div class="loading">
      <h2>Loading...</h2>
    </div>
  `,
    heatmapContainer
  );
}

async function loadAndRenderDemoData(url: string) {
  renderLoading();
  const demoData = await fetchDemoData(url);
  renderHeatmap(demoData);
}

function renderButtons() {
  const buttonsContainer = document.querySelector(
    '#buttons-container'
  ) as HTMLElement;

  function getHeatmap(): BiowcHeatmap {
    return document.querySelector('#heatmap') as BiowcHeatmap;
  }

  render(
    html`
      <div class="load-data-buttons">
        <button
          id="load-small-data"
          @click=${() => loadAndRenderDemoData(SMALL_DATASET_URL)}
        >
          Load small dataset
        </button>

        <button
          id="load-medium-data"
          @click=${() => loadAndRenderDemoData(MEDIUM_DATASET_URL)}
        >
          Load medium dataset
        </button>

        <button
          id="load-large-data"
          @click=${() => loadAndRenderDemoData(LARGE_DATASET_URL)}
        >
          Load large dataset
        </button>
      </div>

      <div class="zoom-buttons">
        <button
          id="zoom-in"
          @click=${() => {
            const heatmap = getHeatmap();
            heatmap.zoomX += 0.1;
            heatmap.zoomY += 0.1;
          }}
        >
          Zoom in
        </button>

        <button
          id="zoom-out"
          @click=${() => {
            const heatmap = getHeatmap();
            heatmap.zoomX -= 0.1;
            heatmap.zoomY -= 0.1;
          }}
        >
          Zoom out
        </button>
      </div>
    `,
    buttonsContainer
  );
}

(async function main() {
  await loadAndRenderDemoData(SMALL_DATASET_URL);
  renderButtons();
})();
