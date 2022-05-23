import { css } from 'lit';

export default css`
:host {
    overflow: auto;
    transform: translateZ(0);
}

::slotted(*) {
    overflow: hidden;
    width: var(--biowc-heatmap-zoom-width, 100%);
    height: var(--biowc-heatmap-zoom-height, 100%);
}
`;
