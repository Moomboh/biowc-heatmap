import { css } from 'lit';

export default css`
svg {
    shape-rendering: crispEdges;
}

.selected {
    filter: brightness(0.8);
}

.hovered {
    cursor: pointer;
    filter: brightness(1.2);
}
`;
