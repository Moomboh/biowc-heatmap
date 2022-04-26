import { html, LitElement, HTMLTemplateResult } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import styles from './biowc-heatmap.css.js';
import { BiowcHeatmapHeatmap } from './BiowcHeatmapHeatmap.js';
import { BiowcHeatmapLabels, TextAlign } from './BiowcHeatmapLabels.js';
import {
  BiowcHeatmapDendrogram,
  DendrogramList,
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
  [key in Side]?: DendrogramNode | DendrogramList;
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
  zoomX = 1;

  @property({ type: Number })
  zoomY = 1;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  labels: Labels = {};

  @property({ attribute: false })
  dendrograms: Dendrograms = {};

  @query('.heatmap')
  private _heatmapWrapperElement: HTMLElement | undefined;

  @queryAll('.labels-top, .labels-bottom, .dendrogram-top, .dendrogram-bottom')
  // eslint-disable-next-line no-undef
  private _horizontalWrappers: NodeListOf<HTMLElement> | undefined;

  @queryAll('.labels-left, .labels-right, .dendrogram-left, .dendrogram-right')
  // eslint-disable-next-line no-undef
  private _verticalWrappers: NodeListOf<HTMLElement> | undefined;

  @state()
  private _heatmapWrapperWidth: number = 1;

  @state()
  private _heatmapWrapperHeight: number = 1;

  @state()
  private _hoveredCellX: number | null = null;

  @state()
  private _hoveredCellY: number | null = null;

  private _resizeObserver: ResizeObserver | undefined;

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
    this._resizeObserver = new ResizeObserver(this._onResize.bind(this));
    this._resizeObserver.observe(this);
  }

  render(): HTMLTemplateResult {
    return html`
      ${this._renderHeatmap()}
      ${this._renderSideLabels()}
      ${this._renderDendrograms()}
    `;
  }

  private _onResize() {
    this._heatmapWrapperWidth = this._heatmapWrapperElement?.clientWidth ?? 1;
    this._heatmapWrapperHeight = this._heatmapWrapperElement?.clientHeight ?? 1;
    this.zoomX = 1 / this._fittedZoomX;
    this.zoomY = 1 / this._fittedZoomY;
  }

  private _renderHeatmap(): HTMLTemplateResult {
    return html`
      <div 
        class="heatmap"
        @scroll="${this._onHeatmapScroll}"
      >
        <biowc-heatmap-heatmap
          .data=${this.data}
          .color=${this.color}
          @biowc-heatmap-cell-hover=${this._onCellHover}
          style="
            width: ${this._fittedZoomX * 100}%;
            height: ${this._fittedZoomY * 100}%;
          "
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

        if (this._fittedZoomY > 1 && horizontal) {
          scrollBarsStyle = 'overflow-y: scroll';
        }

        if (this._fittedZoomX > 1 && !horizontal) {
          scrollBarsStyle = 'overflow-x: scroll';
        }

        return html`
        <div
          style=${scrollBarsStyle}
          class="labels labels-${side}"
        >
          <biowc-heatmap-labels
            .labels=${this.labels[side]}
            ?horizontal=${horizontal}
            .hoveredIndex=${
              horizontal ? this._hoveredCellX : this._hoveredCellY
            }
            textalign=${BiowcHeatmap.sideToTextAlign(side)}
            style="${
              horizontal
                ? `width: ${this._fittedZoomX * 100}%`
                : `height: ${this._fittedZoomY * 100}%`
            }"
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

        if (this._fittedZoomY > 1 && horizontal) {
          scrollBarsStyle = 'overflow-y: scroll';
        }

        if (this._fittedZoomX > 1 && !horizontal) {
          scrollBarsStyle = 'overflow-x: scroll';
        }

        return html`
        <div
          style=${scrollBarsStyle}
          class="dendrogram dendrogram-${side}"
        >
          <biowc-heatmap-dendrogram
            .dendrogram=${this.dendrograms[side]}
            .side=${side}
            style="${
              horizontal
                ? `width: ${this._fittedZoomX * 100}%`
                : `height: ${this._fittedZoomY * 100}%`
            }"
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

  private get _fitZoomXFactor(): number {
    return Math.max(
      1,
      (this._nCols / this._nRows) *
        (this._heatmapWrapperHeight / this._heatmapWrapperWidth)
    );
  }

  private get _fitZoomYFactor(): number {
    return Math.max(
      1,
      (this._nRows / this._nCols) *
        (this._heatmapWrapperWidth / this._heatmapWrapperHeight)
    );
  }

  private get _fittedZoomX() {
    if (this._nCols > this._nRows) {
      return this.zoomX * this._fitZoomXFactor;
    }

    return this.zoomX;
  }

  private get _fittedZoomY() {
    if (this._nRows > this._nCols) {
      return this.zoomY * this._fitZoomYFactor;
    }

    return this.zoomY;
  }

  private async _onWheel(event: WheelEvent) {
    // TODO: improve zoom performance and fix issues like being able to zoom out too much
    if (event.ctrlKey) {
      event.preventDefault();

      const deltaZoom = -event.deltaY;

      const minXzoom =
        this._heatmapWrapperWidth / this._heatmapWrapperHeight <
        this._nRows / this._nCols
          ? 1
          : 1 / this._fitZoomXFactor;

      const minYzoom =
        this._heatmapWrapperWidth / this._heatmapWrapperHeight >
        this._nRows / this._nCols
          ? 1
          : 1 / this._fitZoomYFactor;

      if (event.shiftKey) {
        this.zoomX = Math.max(
          minXzoom,
          this.zoomX +
            deltaZoom / this._heatmapWrapperWidth / this._fitZoomXFactor
        );
      } else {
        this.zoomY = Math.max(
          minYzoom,
          this.zoomY +
            deltaZoom / this._heatmapWrapperHeight / this._fitZoomYFactor
        );
      }
    }
  }

  private _onHeatmapScroll() {
    const scrollTop = this._heatmapWrapperElement?.scrollTop ?? 0;
    const scrollLeft = this._heatmapWrapperElement?.scrollLeft ?? 0;

    this._verticalWrappers?.forEach(wrapper => {
      // eslint-disable-next-line no-param-reassign
      wrapper.scrollTop = scrollTop;
    });

    this._horizontalWrappers?.forEach(wrapper => {
      // eslint-disable-next-line no-param-reassign
      wrapper.scrollLeft = scrollLeft;
    });
  }

  private _onCellHover(event: CustomEvent) {
    this._hoveredCellX = event.detail.x;
    this._hoveredCellY = event.detail.y;
  }
}
