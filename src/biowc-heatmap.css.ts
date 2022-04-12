import { css } from 'lit';

export default css`

:host {
    display: block;
}

.heatmap-background {
    fill: var(--heatmap-background-color, rgba(1, 1, 1, 0));
}

.label-box {
    fill: var(--label-background-color, rgba(1, 1, 1, 0));
}

.label-text {
    fill: var(--label-text-color, #222222);
    font-family: var(--label-text-font-family, sans-serif);
}

.scrollbar {
    fill: var(--scrollbar-color, rgba(0.8, 0.8, 0.8, 0.5));
}

`;
