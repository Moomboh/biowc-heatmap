import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
  position: relative;
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


.zoom-overlay {
  display: none;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:host(.zooming) {
  cursor: zoom-in;
}

:host(.zooming) .zoom-overlay {
  display: block;
}

.heatmap-container {
  overflow: auto;
  transform: translateZ(0);
  grid-area: heatmap;
}

.heatmap {
  transform: translateZ(0);
  width: 100%;
  height: 100%;
}

.top-container {
  grid-area: top;
  display: grid;
  grid-template-areas: 
    "axis-label"
    "dendrogram"
    "labels"
    "color-annot";
  grid-template-rows: 
    var(--biowc-heatmap-axis-label-top-size, auto)
    var(--biowc-heatmap-dendrogram-top-size, auto)
    var(--biowc-heatmap-labels-top-size, auto)
    var(--biowc-heatmap-color-annot-top-size, 12px);
  grid-template-columns: 1fr;
}

.left-container {
  grid-area: left;
  display: grid;
  grid-template-areas: 
    "axis-label dendrogram labels color-annot";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-axis-label-left-size, auto)
    var(--biowc-heatmap-dendrogram-left-size, auto)
    var(--biowc-heatmap-labels-left-size, auto)
    var(--biowc-heatmap-color-annot-left-size, 12px);
}

.right-container {
  grid-area: right;
  display: grid;
  grid-template-areas: 
    "color-annot labels dendrogram axis-label";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-color-annot-right-size, 12px)
    var(--biowc-heatmap-labels-right-size, auto)
    var(--biowc-heatmap-dendrogram-right-size, auto)
    var(--biowc-heatmap-axis-label-right-size, auto);
}

.bottom-container {
  grid-area: bottom;
  display: grid;
  grid-template-areas: 
    "color-annot"
    "labels"
    "dendrogram"
    "axis-label";
  grid-template-rows: 
    var(--biowc-heatmap-color-annot-bottom-size, 12px)
    var(--biowc-heatmap-labels-bottom-size, auto)
    var(--biowc-heatmap-dendrogram-bottom-size, auto)
    var(--biowc-heatmap-axis-label-bottom-size, auto);
  grid-template-columns: 1fr;
}

.container .axis-label {
  grid-area: axis-label;
}

.container .dendrogram {
  grid-area: dendrogram;
}

.container .labels {
  grid-area: labels;
}

.container .color-annot {
  grid-area: color-annot;
}

.axis-label {
  text-align: center;
  font-size: var(--biowc-heatmap-axis-label-font-size, 1.5em);
  padding: var(--biowc-heatmap-axis-label-padding, 0.25em);
  background: var(--biowc-heatmap-axis-label-background-color, #ffffff);
}

.left-container .axis-label,
.right-container .axis-label {
  transform: rotate(-180deg);
  writing-mode: vertical-rl;
}
`;
