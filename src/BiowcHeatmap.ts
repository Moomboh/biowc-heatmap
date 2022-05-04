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
import {
  BiowcHeatmapLabels,
  LabelHoverEvent,
  LabelSelectEvent,
  TextAlign,
} from './BiowcHeatmapLabels.js';
import {
  BiowcHeatmapDendrogram,
  DendrogramHoverEvent,
  DendrogramList,
  DendrogramNode,
  DendrogramSelectEvent,
} from './BiowcHeatmapDendrogram.js';
import { computed } from './util/computedDecorator.js';

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

export type HeatmapHoverEvent = CustomEvent<{
  hoveredCols: Set<number>;
  hoveredRows: Set<number>;
}>;

export type HeatmapSelectEvent = CustomEvent<{
  selectedCols: Set<number>;
  selectedRows: Set<number>;
}>;

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
  hoveredRows: Set<number> = new Set();

  @property({ attribute: false })
  hoveredCols: Set<number> = new Set();

  @property({ attribute: false })
  selectedRows: Set<number> = new Set();

  @property({ attribute: false })
  selectedCols: Set<number> = new Set();

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
            .hoveredIndices=${horizontal ? this.hoveredCols : this.hoveredRows}
            .selectedIndices=${
              horizontal ? this.selectedCols : this.selectedRows
            }
            @biowc-heatmap-label-hover=${this._onLabelHover}
            @biowc-heatmap-label-select=${this._onLabelSelect(side)}
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
            .hoveredIndices=${horizontal ? this.hoveredCols : this.hoveredRows}
            .selectedIndices=${
              horizontal ? this.selectedCols : this.selectedRows
            }
            @biowc-heatmap-dendrogram-select=${this._onDendrogramSelect(side)}
            @biowc-heatmap-dendrogram-hover=${this._onDendrogramHover(side)}
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

  private _onLabelHover(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: LabelHoverEvent) => {
      const { hovered } = event.detail;

      if (horizontal) {
        this.hoveredCols = hovered;
      } else {
        this.hoveredRows = hovered;
      }

      this._dispatchSelectEvent();
    };
  }

  private _onLabelSelect(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: LabelSelectEvent) => {
      const { selected } = event.detail;

      if (horizontal) {
        this.selectedCols = selected;
      } else {
        this.selectedRows = selected;
      }

      this._dispatchSelectEvent();
    };
  }

  @eventOptions({ passive: true })
  private _onDendrogramHover(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: DendrogramHoverEvent) => {
      const { hovered } = event.detail;

      if (horizontal) {
        this.hoveredCols = hovered;
      } else {
        this.hoveredRows = hovered;
      }

      this._dispatchHoverEvent();
    };
  }

  @eventOptions({ passive: true })
  private _onDendrogramSelect(side: Side) {
    const horizontal = side === Side.top || side === Side.bottom;

    return (event: DendrogramSelectEvent) => {
      const selected = new Set([...event.detail.selected]);

      if (horizontal) {
        this.selectedCols = selected;
      } else {
        this.selectedRows = selected;
      }

      this._dispatchSelectEvent();
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
    this.hoveredCols = new Set([event.detail.x]);
    this.hoveredRows = new Set([event.detail.y]);
    this._dispatchHoverEvent();
  }

  private _dispatchHoverEvent() {
    const hoverEvent: HeatmapHoverEvent = new CustomEvent(
      'biowc-heatmap-hover',
      {
        detail: {
          hoveredCols: this.hoveredCols,
          hoveredRows: this.hoveredRows,
        },
      }
    );

    this.dispatchEvent(hoverEvent);
  }

  private _dispatchSelectEvent() {
    const selectEvent: HeatmapSelectEvent = new CustomEvent(
      'biowc-heatmap-select',
      {
        detail: {
          selectedCols: this.selectedCols,
          selectedRows: this.selectedRows,
        },
      }
    );

    this.dispatchEvent(selectEvent);
  }
}
