import { html } from 'lit';
import { fixture, expect, assert } from '@open-wc/testing';
import { stub, match } from 'sinon';
import { BiowcHeatmap, Side } from '../src/BiowcHeatmap.js';
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

  it(`logs error when labels and data lengths mismatch`, async () => {
    const consoleErrorStub = stub(console, 'error');
    const el = await fixture<BiowcHeatmap>(
      html`<biowc-heatmap
        .data=${[
          [1, 1],
          [1, 1],
        ]}
      ></biowc-heatmap>`
    );

    for (const side of Object.values(Side)) {
      el.labels = {
        [side]: [side],
      };

      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;

      assert(
        consoleErrorStub.calledWith(match((err: string) => err.includes(side)))
      );
    }

    consoleErrorStub.restore();
  });
});
