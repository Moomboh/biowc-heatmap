import { css } from 'lit';

export default css`
:host {
    overflow: hidden;
    transform: translateZ(0);
}

::slotted(*) {
    overflow: hidden;
    transform: translateZ(0);
}
`;
