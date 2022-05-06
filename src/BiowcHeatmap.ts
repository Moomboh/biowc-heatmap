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
import { BiowcHeatmapZoomContainer } from './BiowcHeatmapZoomContainer.js';
import { BiowcHeatmapColorAnnot } from './BiowcHeatmapColorAnnot.js';

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

export type ColorAnnots = {
  [key in Side]?: string[];
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
      'biowc-heatmap-zoom-container': BiowcHeatmapZoomContainer,
      'biowc-heatmap-dendrogram': BiowcHeatmapDendrogram,
      'biowc-heatmap-labels': BiowcHeatmapLabels,
      'biowc-heatmap-color-annot': BiowcHeatmapColorAnnot,
    };
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
  colorAnnots: ColorAnnots = {};

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

  @queryAll('.top-container, .bottom-container')
  // eslint-disable-next-line no-undef
  private _horizontalContainers: NodeListOf<HTMLElement> | undefined;

  @queryAll('.left-container, .right-container')
  // eslint-disable-next-line no-undef
  private _verticalContainers: NodeListOf<HTMLElement> | undefined;

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
  }

  render(): HTMLTemplateResult {
    this._setComputedStyleProps();

    return html`
      ${this._renderHeatmap()}
      ${this._renderSides()}
    `;
  }

  private _setComputedStyleProps() {
    for (const side of Object.keys(Side)) {
      const sideSizeProp = `--biowc-heatmap-${side}-size`;

      if (!this._hasSide[side]) {
        this.style.setProperty(sideSizeProp, '0');
      } else {
        this.style.removeProperty(sideSizeProp);
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

  private _renderSides(): HTMLTemplateResult {
    return html`
      ${Object.values(Side).map(side => {
        if (!this._hasSide[side]) {
          return html``;
        }

        const horizontal = side === Side.top || side === Side.bottom;
        const hoveredIndices = horizontal ? this.hoveredCols : this.hoveredRows;
        const selectedIndices = horizontal
          ? this.selectedCols
          : this.selectedRows;
        const textAlign =
          side === Side.left || side === Side.bottom
            ? TextAlign.right
            : TextAlign.left;

        return html`
          <biowc-heatmap-zoom-container
            .side=${side}
            .zoomX=${this.zoomX}
            .zoomY=${this.zoomY}
            @wheel=${horizontal ? this._onScrollX : this._onScrollY}
            class="container ${side}-container"
          >
            ${
              this._hasSideDendrogram[side]
                ? html`
                <biowc-heatmap-dendrogram
                  .dendrogram=${this.dendrograms[side]!}
                  .side=${side}
                  .hoveredIndices=${hoveredIndices}
                  .selectedIndices=${selectedIndices}
                  @biowc-heatmap-dendrogram-select=
                    ${this._onDendrogramSelect(side)}
                  @biowc-heatmap-dendrogram-hover=
                    ${this._onDendrogramHover(side)}
                  yShift="0.1"
                  class="dendrogram"
                ></biowc-heatmap-dendrogram>`
                : html``
            }

            ${
              this._hasSideLabels[side]
                ? html`
                <biowc-heatmap-labels
                  .labels=${this.labels[side]}
                  ?horizontal=${horizontal}
                  .hoveredIndices=${hoveredIndices}
                  .selectedIndices=${selectedIndices}
                  @biowc-heatmap-label-hover=${this._onLabelHover}
                  @biowc-heatmap-label-select=${this._onLabelSelect(side)}
                  textalign=${textAlign}
                  class="labels"
                ></biowc-heatmap-labels>`
                : html``
            }

            ${
              this._hasSideColorAnnots[side]
                ? html`
                <biowc-heatmap-color-annot
                  .colorAnnots=${this.colorAnnots[side]}
                  .side=${side}
                  class="color-annot"
                ></biowc-heatmap-color-annot>`
                : html``
            }

          </biowc-heatmap-zoom-container>
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

  @computed('colorAnnots')
  private get _hasSideColorAnnots() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.colorAnnots[side]])
    );
  }

  @computed('_hasSideLabels', '_hasSideDendrogram', '_hasSideColorAnnots')
  private get _hasSide() {
    return Object.fromEntries(
      Object.values(Side).map(side => [
        side,
        this._hasSideLabels[side] ||
          this._hasSideDendrogram[side] ||
          this._hasSideColorAnnots[side],
      ])
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

    this._verticalContainers?.forEach(wrapper => {
      // eslint-disable-next-line no-param-reassign
      wrapper.scrollTop = scrollTop;
    });

    this._horizontalContainers?.forEach(wrapper => {
      // eslint-disable-next-line no-param-reassign
      wrapper.scrollLeft = scrollLeft;
    });
  }

  private _onCellHover(event: CustomEvent) {
    this.hoveredCols = new Set([event.detail.x]);
    this.hoveredRows = new Set([event.detail.y]);
    this._dispatchHoverEvent();
  }

  // TODO: use native scroll for smooth scrolling
  @eventOptions({ passive: true })
  private _onScrollX(event: WheelEvent) {
    if (this._heatmapWrapperElement === undefined) {
      return;
    }
    this._heatmapWrapperElement.scrollLeft += event.deltaX;
  }

  @eventOptions({ passive: true })
  private _onScrollY(event: WheelEvent) {
    if (this._heatmapWrapperElement === undefined) {
      return;
    }
    this._heatmapWrapperElement.scrollTop += event.deltaY;
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
