import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: block;
}

svg {
    display: block;
}

.color-scale {
    position: relative;
    width: var(--biowc-heatmap-legend-color-scale-gradient-width, 64px);
    height: var(--biowc-heatmap-legend-color-scale-gradient-height, 200px);
    margin: 1em 1em 1em 0;
}

.color-scale-title {
    font-size: 1.1em;
    margin-top: 1.5em;
}

.color-scale-gradient {
    position: absolute;
    left: 0;
    top: 0;
    width: 40%;
    height: 100%;
}

.color-scale-ticks {
    position: absolute;
    left: 30%;
    top: 0;
    width: 20%;
    height: 100%;
}

.color-scale-label {
    position: absolute;
    margin-top: -15%;
    left: 55%;
    width: 45%;
}

.color-scale-ticks-line {
    stroke: var(--biowc-heatmap-legend-color-scale-ticks-line-color, #000000);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
}

.color-annot-label{
    vertical-align: middle;
}

.axis-label {
    font-size: 1.1em;
    margin-top: 1em;
}

.color-annot-label-color {
    display: inline-block;
    width: var(--biowc-heatmap-legend-color-annot-label-color-size, 0.75em);
    height: var(--biowc-heatmap-legend-color-annot-label-color-size, 0.75em);
}

.color-scale-gradient-border {
    fill: none;
    stroke: var(--biowc-heatmap-legend-color-scale-gradient-border-color, #000);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
}
`;

export function svgCss(fontSize: number) {
  return css`
    .axis-label {
        font: ${fontSize * 1.1}px sans-serif;
    }

    .color-annot-label {
        font: ${fontSize}px sans-serif;
    }

    .color-scale-label {
        font: ${fontSize}px sans-serif;
    }

    .color-scale-ticks-line {
        stroke: black;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
    }

    .color-scale-gradient-border {
        fill: none;
        stroke: black;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
    }
  `;
}
