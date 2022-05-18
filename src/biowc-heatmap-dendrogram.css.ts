import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--biowc-heatmap-dendrogram-background-color, #ffffff);
}

svg {
    display: block;
}

.dendrogram-path {
    stroke: black;
    fill: transparent;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
}

.selection-marker {
    stroke: black;
    fill: transparent;
    stroke-width: 6px;
    vector-effect: non-scaling-stroke;
}

.dendrogram-path.hovered,
.selection-marker.hovered {
    stroke: var(--biowc-heatmap-dendrogram-hovered-stroke, #8888ff);
}

path.selected {
    stroke-width: 3px;
`;
