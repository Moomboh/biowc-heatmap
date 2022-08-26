import { css } from 'lit';

export const elementCss = css`
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
    cursor: pointer;
}

.dendrogram-path.hovered,
.selection-marker.hovered {
    stroke: var(--biowc-heatmap-dendrogram-hovered-stroke, #8888ff);
}

.dendrogram-path {
    fill: transparent !important;
}
`;

export const svgCss = css`
.dendrogram-path {
    stroke: black;
    fill: none;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
}

.selection-marker {
    stroke: black;
    fill: none;
    stroke-width: 6px;
    vector-effect: non-scaling-stroke;
}


path.selected {
    stroke-width: 3px;
}
`;

export default css`
    ${elementCss}
    ${svgCss}
`;
