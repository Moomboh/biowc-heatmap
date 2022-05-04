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
    filter: hue-rotate(-90deg);
}

.hover-overlay {
    pointer-events: none;
    fill: var(--biowc-heatmap-heatmap-hover-overlay-color, rgba(127, 127, 255, 0.4));
}

.selected-overlay {
    pointer-events: none;
    fill: var(--biowc-heatmap-heatmap-selected-overlay-color, rgba(127, 127, 255, 0.2));
} 
`;
