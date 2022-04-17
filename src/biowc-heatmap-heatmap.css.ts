import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

svg {
    display: block;
}

.background {
    fill: var(--heatmap-background-color, rgba(1, 1, 1, 0));
}
`;
