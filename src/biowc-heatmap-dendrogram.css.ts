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
    fill: none;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
}
`;
