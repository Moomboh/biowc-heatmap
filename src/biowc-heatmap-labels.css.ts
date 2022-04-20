import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    font-family: var(--biowc-heatmap-labels-font-family, sans-serif);
    font-size: var(--biowc-heatmap-labels-font-size, 18px);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background: var(--biowc-heatmap-labels-background-color, rgba(1, 1, 1, 0));
}

:host([horizontal]) {
    flex-direction: row;
}

.label {
    width: 100%;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.label.hover {
    background: var(--biowc-heatmap-labels-hover-background-color, rgba(127, 127, 255, 1));
}

:host([horizontal]) .label {
    height: 100%;
    width: auto;
    transform: rotate(-180deg);
    writing-mode: vertical-rl;
}

.align-left {
    text-align: left;
}

.align-center {
    text-align: center;
}

.align-right {
    text-align: right;
}
`;
