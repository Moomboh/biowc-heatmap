import { html, LitElement, HTMLTemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import styles from './biowc-heatmap.css.js';
import { BiowcHeatmapHeatmap } from './BiowcHeatmapHeatmap.js';
import { BiowcHeatmapLabels, TextAlign } from './BiowcHeatmapLabels.js';
import {
  BiowcHeatmapDendrogram,
  DendrogramNode,
} from './BiowcHeatmapDendrogram.js';

export enum Side {
  top = 'top',
  left = 'left',
  right = 'right',
  bottom = 'bottom',
}

export type Labels = {
  [key in Side]?: string[];
};

export type Dendrograms = {
  [key in Side]?: DendrogramNode;
};

export type SideNumbers = {
  [key in Side]: number;
};

export type SideBooleans = {
  [key in Side]: boolean;
};

export class BiowcHeatmap extends ScopedElementsMixin(LitElement) {
  static styles = styles;

  static get scopedElements() {
    return {
      'biowc-heatmap-heatmap': BiowcHeatmapHeatmap,
      'biowc-heatmap-labels': BiowcHeatmapLabels,
      'biowc-heatmap-dendrogram': BiowcHeatmapDendrogram,
    };
  }

  static sideToTextAlign(side: Side): TextAlign {
    if (side === Side.left || side === Side.bottom) {
      return TextAlign.right;
    }

    return TextAlign.left;
  }

  @property({ type: String })
  color: String = '#b40000';

  @property({ type: Number })
  gutter: number = 0.02;

  @property({ type: Number })
  zoom = 1;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  labels: Labels = {};

  @property({ attribute: false })
  dendrograms: Dendrograms = {};

  @query('.heatmap')
  private _heatmapWrapperElement: HTMLElement | undefined;

  @property({ attribute: false })
  private _scrollTop: number = 0;

  @property({ attribute: false })
  private _scrollLeft: number = 0;

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
  }

  render(): HTMLTemplateResult {
    this._setComputedStyles();

    return html`
      ${this._renderHeatmap()}
      ${this._renderSideLabels()}
      ${this._renderDendrograms()}
    `;
  }

  private _renderHeatmap(): HTMLTemplateResult {
    return html`
      <div 
        class="heatmap"
        @scroll="${this._onHeatmapScroll}"
          style="padding-top: calc(${this._nRows} / ${this._nCols} * 100%);"
      >
        <biowc-heatmap-heatmap
          .data=${this.data}
          .gutter=${this.gutter}
          .color=${this.color}
          style="width: ${this.zoom * 100}%"
        ></biowc-heatmap-heatmap>
      </div>
    `;
  }

  private _renderSideLabels(): HTMLTemplateResult {
    return html`
      ${Object.values(Side).map(side => {
        if (!this._hasSideLabels[side]) {
          return html``;
        }

        const horizontal = side === Side.top || side === Side.bottom;
        let scrollBarsStyle = '';
        if (this.zoom > 1) {
          scrollBarsStyle = horizontal
            ? 'overflow-y: scroll'
            : 'overflow-x: scroll';
        }

        return html`
        <div
          .scrollLeft=${horizontal ? this._scrollLeft : 0}
          .scrollTop=${!horizontal ? this._scrollTop : 0}
          style=${scrollBarsStyle}
          class="labels labels-${side}"
        >
          <biowc-heatmap-labels
            .labels=${this.labels[side]}
            ?horizontal=${horizontal}
            textalign=${BiowcHeatmap.sideToTextAlign(side)}
            style="${horizontal ? 'width' : 'height'}: ${this.zoom * 100}%"
          ></biowc-heatmap-labels>
        </div>
        `;
      })}
    `;
  }

  private _renderDendrograms(): HTMLTemplateResult {
    return html`
      ${Object.values(Side).map(side => {
        if (!this._hasSideDendrogram[side]) {
          return html``;
        }

        const horizontal = side === Side.top || side === Side.bottom;

        let scrollBarsStyle = '';
        if (this.zoom > 1) {
          scrollBarsStyle = horizontal
            ? 'overflow-y: scroll'
            : 'overflow-x: scroll';
        }

        return html`
        <div
          .scrollLeft=${horizontal ? this._scrollLeft : 0}
          .scrollTop=${!horizontal ? this._scrollTop : 0}
          style=${scrollBarsStyle}
          class="dendrogram dendrogram-${side}"
        >
          <biowc-heatmap-dendrogram
            .dendrogram=${this.dendrograms[side]}
            .side=${side}
            style="${horizontal ? 'width' : 'height'}: ${this.zoom * 100}%"
          ></biowc-heatmap-dendrogram>
        </div>
        `;
      })}
    `;
  }

  private get _nRows(): number {
    return this.data.length;
  }

  private get _nCols(): number {
    if (this._nRows === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  private get _hasSideLabels() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.labels[side]])
    );
  }

  private get _hasSideDendrogram() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.dendrograms[side]])
    );
  }

  private _setComputedStyles() {
    this.style.setProperty(
      '--biowc-heatmap-height',
      `calc(${getComputedStyle(this).width} * ${this._nRows} / ${this._nCols})`
    );
  }

  private async _onWheel(event: WheelEvent) {
    if (event.ctrlKey === true) {
      event.preventDefault();
      const zoom = event.deltaY / -this.clientWidth + this.zoom;
      this.zoom = Math.max(1, zoom);
    }
  }

  private _onHeatmapScroll() {
    this._scrollTop = this._heatmapWrapperElement?.scrollTop ?? 0;
    this._scrollLeft = this._heatmapWrapperElement?.scrollLeft ?? 0;
  }
}
