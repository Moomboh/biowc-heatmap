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
    var(--biowc-heatmap-left-size, 200px)
    auto
    var(--biowc-heatmap-right-size, 200px);
  grid-template-rows:
    var(--biowc-heatmap-top-size, 200px)
    auto
    var(--biowc-heatmap-bottom-size, 200px);
}

.heatmap {
  overflow: auto;
  grid-area: heatmap;
}

.top-container {
  grid-area: top;
  display: grid;
  grid-template-areas: 
    "dendrogram"
    "labels";
  grid-template-rows: 
    var(--biowc-heatmap-dendrogram-top-size, auto)
    var(--biowc-heatmap-labels-top-size, auto);
  grid-template-columns: 1fr;
}

.left-container {
  grid-area: left;
  display: grid;
  grid-template-areas: 
    "dendrogram labels";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-dendrogram-left-size, auto)
    var(--biowc-heatmap-labels-left-size, auto);
}

.right-container {
  grid-area: right;
  display: grid;
  grid-template-areas: 
    "labels dendrogram";
  grid-template-rows: 1fr;
  grid-template-columns: 
    var(--biowc-heatmap-labels-right-size, auto)
    var(--biowc-heatmap-dendrogram-right-size, auto);
}

.bottom-container {
  grid-area: bottom;
  display: grid;
  grid-template-areas: 
    "labels"
    "dendrogram";
  grid-template-rows: 
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
