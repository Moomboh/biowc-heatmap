import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: grid;
    height: var(--biowc-heatmap-height, 100%);
    grid: 
        [dendrogram-top-start]
            "dendrogram-top-left-left dendrogram-top-left dendrogram-top dendrogram-top-right dendrogram-top-right-right"
            var(--biowc-heatmap-dendrogram-top-size, 200px)
        [dendrogram-top-end]
        [labels-top-start]
            "labels-top-left-left labels-top-left labels-top labels-top-right labels-top-right-right"
            var(--biowc-heatmap-labels-top-size, 100px)
        [labels-top-end]
        [heatmap-start]
            "dendrogram-left labels-left heatmap labels-right dendrogram-right"
            1fr
        [heatmap-end]
        [labels-bottom-start]
            "labels-bottom-left-left labels-bottom-left labels-bottom labels-bottom-right labels-bottom-right-right"
            var(--biowc-heatmap-labels-bottom-size, 100px)
        [labels-bottom-end]
        [dendrogram-bottom-start]
            "dendrogram-bottom-left-left dendrogram-bottom-left dendrogram-bottom dendrogram-bottom-right dendrogram-bottom-right-right"
            var(--biowc-heatmap-dendrogram-bottom-size, 200px)
        [dendrogram-top-end]
        /
        var(--biowc-heatmap-dendrogram-left-size, 200px)
        var(--biowc-heatmap-labels-left-size, 100px)
        1fr
        var(--biowc-heatmap-labels-right-size, 100px)
        var(--biowc-heatmap-dendrogram-right-size, 200px);
    gap: var(--biowc-heatmap-gap, 10px);
}

.heatmap {
    overflow: auto;
    will-change: scroll-position;
    grid-area: heatmap;
}

.labels {
    overflow: hidden;
    will-change: scroll-position;
    scrollbar-color: transparent, transparent;
}

.dendrogram {
    overflow: hidden;
    will-change: scroll-position;
    scrollbar-color: transparent, transparent;
}

.heatmap biowc-heatmap-heatmap {
    will-change: width, height;
}

.dendrogram biowc-heatmap-dendrogram {
    will-change: width, height;
}

.labels biowc-heatmap-labels {
    will-change: width, height;
}

.labels-top {
    grid-area: labels-top;
}

.labels-left {
    grid-area: labels-left;
}

.labels-right {
    grid-area: labels-right;
}

.labels-bottom {
    grid-area: labels-bottom;
}

.dendrogram-top {
    grid-area: dendrogram-top;
}

.dendrogram-left {
    grid-area: dendrogram-left;
}

.dendrogram-right {
    grid-area: dendrogram-right;
}

.dendrogram-bottom {
    grid-area: dendrogram-bottom;
}
`;
