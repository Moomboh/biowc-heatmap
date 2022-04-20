import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: block;
    background: var(--biowc-heatmap-heatmap-background-color, rgba(1, 1, 1, 0));
}

svg {
    display: block;
    shape-rendering: optimizeSpeed;
}

.cell {
    cursor: pointer;
}

.cell:hover {
    fill: var(--biowc-heatmap-heatmap-hover-border-color, rgba(127, 127, 255, 1));
}
`;
