import { html, LitElement, HTMLTemplateResult } from 'lit';
import { eventOptions, property, query, queryAll } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import styles from './biowc-heatmap.css.js';
import {
  BiowcHeatmapHeatmap,
  defaultCellColor,
} from './BiowcHeatmapHeatmap.js';
import { BiowcHeatmapLabels, TextAlign } from './BiowcHeatmapLabels.js';
import {
  BiowcHeatmapDendrogram,
  DendrogramList,
  DendrogramNode,
} from './BiowcHeatmapDendrogram.js';
import { computed } from './util/computedDecorator.js';
import { BiowcHeatmapZoomContainer } from './BiowcHeatmapZoomContainer.js';
import {
  BiowcHeatmapColorAnnot,
  ColorLabels,
} from './BiowcHeatmapColorAnnot.js';
import {
  BiowcHeatmapHoverableInterface,
  HoverEvent,
} from './mixins/BiowcHeatmapHoverableMixin.js';
import {
  BiowcHeatmapSelectableInterface,
  SelectEvent,
} from './mixins/BiowcHeatmapSelectableMixin.js';
import { ColorScaleConfig } from './util/colors.js';

export enum Side {
  top = 'top',
  left = 'left',
  right = 'right',
  bottom = 'bottom',
}

export const SIDES = Object.values(Side);

export type Labels = {
  [key in Side]?: string[];
};

export type AxisLabels = {
  [key in Side]?: string;
};

export type Dendrograms = {
  [key in Side]?: DendrogramNode | DendrogramList;
};

export type ColorAnnots = {
  [key in Side]?: string[];
};

export type ColorAnnotLabels = {
  [key in Side]?: ColorLabels;
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

  @property({ type: Number })
  zoomFactor = 1.1;

  /**
   * @deprecated since version 0.2.
   * Will be deleted in version 1.0.
   *
   * TODO: Remove in version 1.0.
   * */
  @property({ type: String })
  get color() {
    // eslint-disable-next-line no-console
    console.warn(
      `\`${this.constructor.name}.color\` is deprecated. Use \`${this.constructor.name}.cellColor\` instead.`
    );
    return this.cellColor;
  }

  set color(color: string) {
    // eslint-disable-next-line no-console
    console.warn(
      `\`${this.constructor.name}.color\` is deprecated. Use \`${this.constructor.name}.cellColor\` instead.`
    );
    this.cellColor = color;
  }

  @property({ attribute: false })
  cellColor: string = defaultCellColor;

  @property({ attribute: false })
  @computed('color', 'colorScale')
  get cellColorScale(): ColorScaleConfig {
    const { cellColor } = this;

    return (
      this._cellColorScale ?? {
        colors: ['rgb(255,255,255)', cellColor],
        values: [0, 1],
      }
    );
  }

  set cellColorScale(colorScale: ColorScaleConfig) {
    this._cellColorScale = colorScale;
  }

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  labels: Labels = {};

  @property({ attribute: false })
  axisLabels: AxisLabels = {};

  @property({ attribute: false })
  dendrograms: Dendrograms = {};

  @property({ attribute: false })
  colorAnnots: ColorAnnots = {};

  @property({ attribute: false })
  colorAnnotLabels: ColorAnnotLabels = {};

  get zoomX() {
    return this._zoomX;
  }

  set zoomX(zoomX: number) {
    this._zoomX = zoomX;
    this._updateZoomX(zoomX);
  }

  get zoomY() {
    return this._zoomY;
  }

  set zoomY(zoomY: number) {
    this._zoomY = zoomY;
    this._updateZoomY(zoomY);
  }

  get hoveredRows(): Set<number> {
    return this._hoveredRows;
  }

  set hoveredRows(hoveredRows: Set<number>) {
    this._hoveredRows = hoveredRows;
    this._updateHoveredRows(this._hoveredRows);
  }

  get hoveredCols(): Set<number> {
    return this._hoveredCols;
  }

  set hoveredCols(hoveredCols: Set<number>) {
    this._hoveredCols = hoveredCols;
    this._updateHoveredCols(this._hoveredCols);
  }

  get selectedRows(): Set<number> {
    return this._selectedRows;
  }

  set selectedRows(selectedRows: Set<number>) {
    this._selectedRows = selectedRows;
    this._updateSelectedRows(this._selectedRows);
  }

  get selectedCols(): Set<number> {
    return this._selectedCols;
  }

  set selectedCols(selectedCols: Set<number>) {
    this._selectedCols = selectedCols;
    this._updateSelectedCols(this._selectedCols);
  }

  private _zoomX = 1;

  private _zoomY = 1;

  private _hoveredRows: Set<number> = new Set();

  private _hoveredCols: Set<number> = new Set();

  private _selectedRows: Set<number> = new Set();

  private _selectedCols: Set<number> = new Set();

  @query('.heatmap')
  private _heatmap: HTMLElement | undefined;

  @query('.heatmap-container')
  private _heatmapContainer: HTMLElement | undefined;

  @queryAll('.container')
  private _zoomContainers: BiowcHeatmapZoomContainer[] | undefined;

  @query('.top-container')
  private _topContainer: BiowcHeatmapZoomContainer | undefined;

  @query('.left-container')
  private _leftContainer: BiowcHeatmapZoomContainer | undefined;

  @query('.right-container')
  private _rightContainer: BiowcHeatmapZoomContainer | undefined;

  @query('.bottom-container')
  private _bottomContainer: BiowcHeatmapZoomContainer | undefined;

  @queryAll('.row-hoverable')
  private _rowHoverables: HTMLElement[] | undefined;

  @queryAll('.col-hoverable')
  private _colHoverables: HTMLElement[] | undefined;

  @queryAll('.row-selectable')
  private _rowSelectables: HTMLElement[] | undefined;

  @queryAll('.col-selectable')
  private _colSelectables: HTMLElement[] | undefined;

  @queryAll('.x-zoomable')
  private _xZoomables: HTMLElement[] | undefined;

  @queryAll('.y-zoomable')
  private _yZoomables: HTMLElement[] | undefined;

  private _cellColorScale: ColorScaleConfig | undefined;

  constructor() {
    super();

    this.addEventListener('wheel', this._handleWheel.bind(this), {
      capture: true,
    });
  }

  render(): HTMLTemplateResult {
    return html`
      ${this._renderHeatmap()}
      ${this._renderSides()}
    `;
  }

  private _renderHeatmap(): HTMLTemplateResult {
    return html`
      <div 
        class="heatmap-container"
        @scroll="${this._handleHeatmapScroll}"
      >
        <biowc-heatmap-heatmap
          .data=${this.data}
          .cellColorScale=${this.cellColorScale}
          @biowc-heatmap-cell-hover=${this._handleCellHover}
          class="heatmap"
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
        const hoverableClass = horizontal ? 'col-hoverable' : 'row-hoverable';
        const selectableClass = horizontal
          ? 'col-selectable'
          : 'row-selectable';
        const zoomableClass = horizontal ? 'x-zoomable' : 'y-zoomable';
        const textAlign =
          side === Side.left || side === Side.bottom
            ? TextAlign.right
            : TextAlign.left;

        return html`
          <biowc-heatmap-zoom-container
            .side=${side}
            class="container ${side}-container"
          >
            ${
              this.axisLabels[side]
                ? html`
                <div class="axis-label">
                  ${this.axisLabels[side]}
                </div>`
                : html``
            }
            ${
              this._hasSideDendrogram[side]
                ? html`
                <biowc-heatmap-dendrogram
                  .dendrogram=${this.dendrograms[side]!}
                  .side=${side}
                  @biowc-heatmap-side-select=
                    ${this._handleSelect(horizontal)}
                  @biowc-heatmap-side-hover=
                    ${this._handleHover(horizontal)}
                  class="dendrogram ${selectableClass} ${hoverableClass} ${zoomableClass}"
                ></biowc-heatmap-dendrogram>`
                : html``
            }

            ${
              this._hasSideLabels[side]
                ? html`
                <biowc-heatmap-labels
                  .labels=${this.labels[side]}
                  ?horizontal=${horizontal}
                  @biowc-heatmap-side-hover=${this._handleHover(horizontal)}
                  @biowc-heatmap-side-select=${this._handleSelect(horizontal)}
                  textalign=${textAlign}
                  class="labels ${selectableClass} ${hoverableClass} ${zoomableClass}"
                ></biowc-heatmap-labels>`
                : html``
            }

            ${
              this._hasSideColorAnnots[side]
                ? html`
                <biowc-heatmap-color-annot
                  .colorAnnots=${this.colorAnnots[side]}
                  .side=${side}
                  @biowc-heatmap-side-hover=${this._handleHover(horizontal)}
                  @biowc-heatmap-side-select=${this._handleSelect(horizontal)}
                  class="color-annot ${selectableClass} ${hoverableClass} ${zoomableClass}"
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

  // TODO: Check if axis labels are shown and refactor to deduplicate above code
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

  private _updateSelectedRows(selectedRows: Set<number>) {
    this._rowSelectables?.forEach(s => {
      const selectable = s as HTMLElement & BiowcHeatmapSelectableInterface;
      selectable.selectedIndices = selectedRows;
    });
  }

  private _updateSelectedCols(selectedCols: Set<number>) {
    this._colSelectables?.forEach(s => {
      const selectable = s as HTMLElement & BiowcHeatmapSelectableInterface;
      selectable.selectedIndices = selectedCols;
    });
  }

  private _updateHoveredRows(hoveredRows: Set<number>) {
    this._rowHoverables?.forEach(s => {
      const hoverable = s as HTMLElement & BiowcHeatmapHoverableInterface;
      hoverable.hoveredIndices = hoveredRows;
    });
  }

  private _updateHoveredCols(hoveredCols: Set<number>) {
    this._colHoverables?.forEach(s => {
      const hoverable = s as HTMLElement & BiowcHeatmapHoverableInterface;
      hoverable.hoveredIndices = hoveredCols;
    });
  }

  /**
   * @TODO refactor into zoom container
   */
  private _updateZoomX(zoomX: number) {
    this._updateHeatmapZoom();
    this._updateZoomContainers();

    this._xZoomables?.forEach(z => {
      const zoomable = z as HTMLElement;
      zoomable.style.width = `${zoomX * 100}%`;
    });
  }

  private _updateZoomY(zoomY: number) {
    this._updateHeatmapZoom();
    this._updateZoomContainers();

    this._yZoomables?.forEach(z => {
      const zoomable = z as HTMLElement;
      zoomable.style.height = `${zoomY * 100}%`;
    });
  }

  private _updateHeatmapZoom() {
    if (this._heatmap) {
      this._heatmap.style.transform = `scale(${this.zoomX}, ${
        this.zoomY
      }) translate(${50 * (1 - 1 / this.zoomX)}%, ${
        50 * (1 - 1 / this.zoomY)
      }%)`;
    }
  }

  private _updateZoomContainers() {
    this._zoomContainers?.forEach(z => {
      // eslint-disable-next-line no-param-reassign
      z.zoomX = this.zoomX;
      // eslint-disable-next-line no-param-reassign
      z.zoomY = this.zoomY;
    });
  }

  private _handleWheel(event: WheelEvent) {
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

  private _handleHover(horizontal: boolean) {
    return (event: HoverEvent) => {
      const { hoveredIndices } = event.detail;

      if (horizontal) {
        this.hoveredCols = hoveredIndices;
      } else {
        this.hoveredRows = hoveredIndices;
      }

      this._dispatchHoverEvent();
    };
  }

  private _handleSelect(horizontal: boolean) {
    return (event: SelectEvent) => {
      const { selectedIndices } = event.detail;

      if (horizontal) {
        this.selectedCols = selectedIndices;
      } else {
        this.selectedRows = selectedIndices;
      }

      this._dispatchSelectEvent();
    };
  }

  @eventOptions({ passive: true, capture: true })
  private _handleHeatmapScroll() {
    const scrollTop = this._heatmapContainer!.scrollTop!;
    const scrollLeft = this._heatmapContainer!.scrollLeft!;

    if (this._topContainer) {
      this._topContainer.scrollLeft = scrollLeft;
    }

    if (this._leftContainer) {
      this._leftContainer.scrollTop = scrollTop;
    }

    if (this._rightContainer) {
      this._rightContainer.scrollTop = scrollTop;
    }

    if (this._bottomContainer) {
      this._bottomContainer.scrollLeft = scrollLeft;
    }
  }

  private _handleCellHover(event: CustomEvent) {
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
