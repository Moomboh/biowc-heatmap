import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { AdvancedHeatmap } from '../src/AdvancedHeatmap.js';
import '../src/advanced-heatmap.js';

describe('AdvancedHeatmap', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<AdvancedHeatmap>(
      html`<advanced-heatmap></advanced-heatmap>`
    );

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<AdvancedHeatmap>(
      html`<advanced-heatmap></advanced-heatmap>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<AdvancedHeatmap>(
      html`<advanced-heatmap title="attribute title"></advanced-heatmap>`
    );

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<AdvancedHeatmap>(
      html`<advanced-heatmap></advanced-heatmap>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
