import { css } from 'lit';

export default css`
* { box-sizing: border-box; }

:host {
    display: block;
    width: 100%;
    height: 100%;
}

svg {
    display: block;
}

path {
    stroke: black;
    fill: transparent;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
}

path.hovered {
    stroke: blue;
}

path.selected {
    stroke-width: 3px;
}

line {
    stroke: black;
    fill: transparent;
    stroke-width: 6px;
    vector-effect: non-scaling-stroke;
}
`;
