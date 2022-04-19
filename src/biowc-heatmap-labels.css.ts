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
}

:host([horizontal]) {
    flex-direction: row;
}

.label {
    background: var(--biowc-heatmap-labels-background-color, rgba(1, 1, 1, 0));
    width: 100%;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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