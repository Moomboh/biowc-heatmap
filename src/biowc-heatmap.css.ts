import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: grid;
    height: var(--biowc-heatmap-height, 100%);
    grid: [top-start]
            "top-left top top-right"
            var(--biowc-heatmap-labels-top-size, 100px)
        [top-end]
        [center-start]
            "left center right"
            1fr
        [center-end]
        [bottom-start]
            "bottom-left bottom bottom-right"
            var(--biowc-heatmap-labels-bottom-size, 100px)
        [bottom-end]
        /
        var(--biowc-heatmap-labels-left-size, 100px)
        1fr
        var(--biowc-heatmap-labels-right-size, 100px);
    gap: var(--biowc-heatmap-gap, 10px);
}

.labels {
    width: 100%;
    height: 100%;
    overflow: hidden;
    scrollbar-color: transparent, transparent;
}

.heatmap {
    grid-area: center;
    height: 0;
    overflow: auto;
    position: relative;
}

.heatmap biowc-heatmap-heatmap {
    position: absolute;
    top: 0;
    left: 0;
}

.labels-top {
    grid-area: top;
}

.labels-left {
    grid-area: left;
}

.labels-right {
    grid-area: right;
}

.labels-bottom {
    grid-area: bottom;
}
`;
