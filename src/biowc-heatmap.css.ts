import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
  display: grid;
  grid-template-areas:
    '.    top     .    '
    'left heatmap right'
    '.    bottom  .    ';
  grid-template-columns:
    var(--biowc-heatmap-left-size, auto)
    auto
    var(--biowc-heatmap-right-size, auto);
  grid-template-rows:
    var(--biowc-heatmap-top-size, auto)
    auto
    var(--biowc-heatmap-bottom-size, auto);
}

.heatmap {
  overflow: auto;
  grid-area: heatmap;
}

.zoom-tooltip {
  background: var(--biowc-heatmap-zoom-tooltip-background, #ffffff);
  position: fixed;
  top: var(--biowc-heatmap-zoom-tooltip-top, 0);
  left: var(--biowc-heatmap-zoom-tooltip-left, 0);
  padding: 0.5em;
  border-radius: 0 0.5em 0.5em 0.5em;
  cursor: zoom-in;
}

.top-container {
  grid-area: top;
  display: grid;
  grid-template-areas: 
    "dendrogram"
    "labels"
    "color-annot";
  grid-template-rows: 
    var(--biowc-heatmap-dendrogram-top-size, auto)
    var(--biowc-heatmap-labels-top-size, auto)
    var(--biowc-heatmap-color-annot-top-size, 12px);
  grid-template-columns: 1fr;
}

.left-container {
  grid-area: left;
  display: grid;
  grid-template-areas: 
    "dendrogram labels color-annot";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-dendrogram-left-size, auto)
    var(--biowc-heatmap-labels-left-size, auto)
    var(--biowc-heatmap-color-annot-left-size, 12px);
}

.right-container {
  grid-area: right;
  display: grid;
  grid-template-areas: 
    "color-annot labels dendrogram";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-color-annot-right-size, 12px)
    var(--biowc-heatmap-labels-right-size, auto)
    var(--biowc-heatmap-dendrogram-right-size, auto);
}

.bottom-container {
  grid-area: bottom;
  display: grid;
  grid-template-areas: 
    "color-annot"
    "labels"
    "dendrogram";
  grid-template-rows: 
    var(--biowc-heatmap-color-annot-bottom-size, 12px)
    var(--biowc-heatmap-labels-bottom-size, auto)
    var(--biowc-heatmap-dendrogram-bottom-size, auto);
  grid-template-columns: 1fr;
}

.container .dendrogram {
  grid-area: dendrogram;
}

.container .labels {
  grid-area: labels;
}
`;
