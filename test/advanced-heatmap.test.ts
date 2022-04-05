import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { AdvancedHeatmap } from '../src/AdvancedHeatmap.js';
import '../src/advanced-heatmap.js';

describe('AdvancedHeatmap', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<AdvancedHeatmap>(
      html`<advanced-heatmap></advanced-heatmap>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
