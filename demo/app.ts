import { html, render } from 'lit';
import '../src/biowc-heatmap.js';
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
        id="prdb-heatmap"
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
  render(
    html`
      <div class="load-data-buttons">
        <button
          id="load-small-data"
          @click=${() => loadAndRenderDemoData(SMALL_DATASET_URL)}
        >
          Load small dataset (~1.9k)
        </button>

        <button
          id="load-medium-data"
          @click=${() => loadAndRenderDemoData(MEDIUM_DATASET_URL)}
        >
          Load medium dataset (~56k)
        </button>

        <button
          id="load-large-data"
          @click=${() => loadAndRenderDemoData(LARGE_DATASET_URL)}
        >
          Load large dataset (~148k)
        </button>
      </div>

      <div class="description">
        <ul>
          <li>
            Click the buttons above to load protein expression example datasets of different sizes from <a href="https://proteomicsdb.org">proteomicsdb.org</a>.
            
          </li>
          <li>Use <code>ctrl+mousewheel</code> to zoom vertically and <code>ctrl+shift+mousewheel</code> to zoom horizontally</li>
          <li>Use <code>mousewheel</code> to scroll vertically and <code>shift+mousewheel</code> to scroll horizontally</li>
          <li>Click on the dendrogram or labels to select/deselect rows or columns</li>
        </ul>
      </div>
    `,
    buttonsContainer
  );
}

(async function main() {
  await loadAndRenderDemoData(SMALL_DATASET_URL);
  renderButtons();
})();
