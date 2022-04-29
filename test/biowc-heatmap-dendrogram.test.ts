import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  DendrogramList,
  BiowcHeatmapDendrogram,
  DendrogramNode,
} from '../src/BiowcHeatmapDendrogram.js';

window.customElements.define(
  'biowc-heatmap-dendrogram',
  BiowcHeatmapDendrogram
);

describe('BiowcHeatmapDendrogram', () => {
  it('renders equivalent `DendrogramList` and `DendrogramNode` equally', async () => {
    const dendrogramTree: DendrogramNode = {
      left: {
        left: 0,
        right: {
          left: 1,
          right: 2,
          height: 0,
        },
        height: 1,
      },
      right: {
        left: {
          left: 3,
          right: 4,
          height: 0,
        },
        right: 5,
        height: 1,
      },
      height: 2,
    };

    const dendrogramList: DendrogramList = [
      {
        left: 1,
        isLeftDendrogram: false,
        right: 2,
        isRightDendrogram: false,
        height: 0,
      },
      {
        left: 3,
        isLeftDendrogram: false,
        right: 4,
        isRightDendrogram: false,
        height: 0,
      },
      {
        left: 0,
        isLeftDendrogram: false,
        right: 0,
        isRightDendrogram: true,
        height: 1,
      },
      {
        left: 1,
        isLeftDendrogram: true,
        right: 5,
        isRightDendrogram: false,
        height: 1,
      },
      {
        left: 2,
        isLeftDendrogram: true,
        right: 3,
        isRightDendrogram: true,
        height: 2,
      },
    ];

    const dendrogramFromList = await fixture<BiowcHeatmapDendrogram>(html`
      <biowc-heatmap-dendrogram
        .dendrogram=${dendrogramList}
      ></biowc-heatmap-dendrogram>
    `);

    const dendrogramFromTree = await fixture<BiowcHeatmapDendrogram>(html`
      <biowc-heatmap-dendrogram
        .dendrogram=${dendrogramTree}
      ></biowc-heatmap-dendrogram>
    `);

    await dendrogramFromList.updateComplete;

    expect(dendrogramFromTree).shadowDom.to.equal(
      dendrogramFromList.shadowRoot?.innerHTML
    );
  });
});
