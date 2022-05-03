import { html, LitElement, HTMLTemplateResult } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import styles from './biowc-heatmap.css.js';
import { BiowcHeatmapHeatmap } from './BiowcHeatmapHeatmap.js';
import { BiowcHeatmapLabels, TextAlign } from './BiowcHeatmapLabels.js';
import {
  BiowcHeatmapDendrogram,
  DendrogramHoverEvent,
  DendrogramList,
  DendrogramNode,
  DendrogramSelectEvent,
} from './BiowcHeatmapDendrogram.js';
import { computed } from './util/computedDecorator.js';
import range from './util/range.js';

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

  @property({ attribute: false })
  hoveredRows: number[] = [];

  @property({ attribute: false })
  hoveredCols: number[] = [];

  @property({ attribute: false })
  selectedRows: number[] = [];

  @property({ attribute: false })
  selectedCols: number[] = [];

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
    this._setComputedStyleProps();

    return html`
      ${this._renderHeatmap()}
      ${this._renderSideLabels()}
      ${this._renderDendrograms()}
    `;
  }

  private _onResize() {
    this._heatmapWrapperWidth = this._heatmapWrapperElement?.clientWidth ?? 1;
    this._heatmapWrapperHeight = this._heatmapWrapperElement?.clientHeight ?? 1;
  }

  private _setComputedStyleProps() {
    for (const side of Object.keys(Side)) {
      const labelSizeProp = `--biowc-heatmap-labels-${side}-size`;
      const dendrogramSizeProp = `--biowc-heatmap-dendrogram-${side}-size`;

      if (!this._hasSideLabels[side]) {
        this.style.setProperty(labelSizeProp, '0');
      } else {
        this.style.removeProperty(labelSizeProp);
      }

      if (!this._hasSideDendrogram[side]) {
        this.style.setProperty(dendrogramSizeProp, '0');
      } else {
        this.style.removeProperty(dendrogramSizeProp);
      }
    }
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
          .selectedRows=${this.selectedRows}
          .selectedCols=${this.selectedCols}
          .hoveredRows=${this.hoveredRows}
          .hoveredCols=${this.hoveredCols}
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
            .dendrogram=${this.dendrograms[side]!}
            .side=${side}
            @biowc-heatmap-dendrogram-select=${this._onDendrogramSelect(side)}
            yShift="0.1"
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

  @computed('data')
  private get _nRows(): number {
    return this.data.length;
  }

  @computed('_nRows', 'data')
  private get _nCols(): number {
    if (this._nRows === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  @computed('labels')
  private get _hasSideLabels() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.labels[side]])
    );
  }

  @computed('dendrograms')
  private get _hasSideDendrogram() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.dendrograms[side]])
    );
  }

  @computed('_nCols', '_nRows', '_heatmapWrapperHeight', '_heatmapWrapperWidth')
  private get _fitZoomXFactor(): number {
    return Math.max(
      1,
      (this._nCols / this._nRows) *
        (this._heatmapWrapperHeight / this._heatmapWrapperWidth)
    );
  }

  @computed('_nRows', '_nCols', '_heatmapWrapperWidth', '_heatmapWrapperHeight')
  private get _fitZoomYFactor(): number {
    return Math.max(
      1,
      (this._nRows / this._nCols) *
        (this._heatmapWrapperWidth / this._heatmapWrapperHeight)
    );
  }

  @computed('_nCols', '_nRows', 'zoomX', '_fitZoomXFactor')
  private get _fittedZoomX() {
    if (this._nCols > this._nRows) {
      return this.zoomX * this._fitZoomXFactor;
    }

    return this.zoomX;
  }

  @computed('_nRows', '_nCols', 'zoomY', '_fitZoomYFactor')
  private get _fittedZoomY() {
    if (this._nRows > this._nCols) {
      return this.zoomY * this._fitZoomYFactor;
    }

    return this.zoomY;
  }

  private async _onWheel(event: WheelEvent) {
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

  @eventOptions({ passive: true })
  private _onDendrogramHover(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: DendrogramHoverEvent) => {
      const { leftBoundary, rightBoundary } = event.detail;

      if (leftBoundary === null || rightBoundary === null) {
        if (horizontal) {
          this.hoveredCols = [];
        } else {
          this.hoveredRows = [];
        }

        return;
      }

      const hoveredRange = range(leftBoundary, rightBoundary);

      if (horizontal) {
        this.hoveredCols = hoveredRange;
      } else {
        this.hoveredRows = hoveredRange;
      }
    };
  }

  @eventOptions({ passive: true })
  private _onDendrogramSelect(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: DendrogramSelectEvent) => {
      const selected = [...event.detail.selected];

      if (horizontal) {
        this.selectedCols = selected;
      } else {
        this.selectedRows = selected;
      }
    };
  }

  @eventOptions({ passive: true })
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

  @eventOptions({ passive: true })
  private _onCellHover(event: CustomEvent) {
    this._hoveredCellX = event.detail.x;
    this._hoveredCellY = event.detail.y;
  }
}
