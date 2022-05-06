import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcHeatmap } from '../src/BiowcHeatmap.js';
import '../src/biowc-heatmap.js';

describe('BiowcHeatmap', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcHeatmap>(
      html`<biowc-heatmap
        .data=${[
          [1, 1],
          [1, 1],
        ]}
      ></biowc-heatmap>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
