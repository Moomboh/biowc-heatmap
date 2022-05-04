import { html, LitElement, HTMLTemplateResult } from 'lit';
import { eventOptions, property, query, queryAll } from 'lit/decorators.js';
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
  zoomX = 1;

  @property({ type: Number })
  zoomY = 1;

  @property({ type: Number })
  zoomFactor = 1.25;

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

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
  }

  render(): HTMLTemplateResult {
    this._setComputedStyleProps();

    return html`
      ${this._renderHeatmap()}
      ${this._renderSideLabels()}
      ${this._renderDendrograms()}
    `;
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
            width: ${this.zoomX * 100}%;
            height: ${this.zoomY * 100}%;
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

        if (this.zoomY > 1 && horizontal) {
          scrollBarsStyle = 'overflow-y: scroll';
        }

        if (this.zoomX > 1 && !horizontal) {
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
                ? `width: ${this.zoomX * 100}%`
                : `height: ${this.zoomY * 100}%`
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

        if (this.zoomY > 1 && horizontal) {
          scrollBarsStyle = 'overflow-y: scroll';
        }

        if (this.zoomX > 1 && !horizontal) {
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
                ? `width: ${this.zoomX * 100}%`
                : `height: ${this.zoomY * 100}%`
            }"
          ></biowc-heatmap-dendrogram>
        </div>
        `;
      })}
    `;
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

  private _onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const deltaZoomFactor =
        event.deltaY < 0 ? this.zoomFactor : 1 / this.zoomFactor;

      if (event.shiftKey) {
        this.zoomX = Math.max(1, this.zoomX * deltaZoomFactor);
      } else {
        this.zoomY = Math.max(1, this.zoomY * deltaZoomFactor);
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
