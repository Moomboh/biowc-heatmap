import { html, LitElement, HTMLTemplateResult } from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import styles from './biowc-heatmap.css.js';
import { BiowcHeatmapHeatmap } from './BiowcHeatmapHeatmap.js';
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
  ColorHoverEvent,
  ColorLabels,
} from './BiowcHeatmapColorAnnot.js';
import { HoverEvent } from './mixins/BiowcHeatmapHoverableMixin.js';
import { SelectEvent } from './mixins/BiowcHeatmapSelectableMixin.js';
import { ColorScaleConfig } from './util/colors.js';

export enum Side {
  top = 'top',
  left = 'left',
  right = 'right',
  bottom = 'bottom',
}

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
  zoomX = 1;

  @property({ type: Number })
  zoomY = 1;

  @property({ type: Number })
  zoomFactor = 1.1;

  @property({ attribute: false })
  color: string | ColorScaleConfig = '#b40000';

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

  @property({ attribute: false })
  hoveredRows: Set<number> = new Set();

  @property({ attribute: false })
  hoveredCols: Set<number> = new Set();

  @property({ attribute: false })
  selectedRows: Set<number> = new Set();

  @property({ attribute: false })
  selectedCols: Set<number> = new Set();

  @query('.heatmap')
  private _heatmapContainer: HTMLElement | undefined;

  @query('.top-container')
  private _topContainer: HTMLElement | undefined;

  @query('.left-container')
  private _leftContainer: HTMLElement | undefined;

  @query('.right-container')
  private _rightContainer: HTMLElement | undefined;

  @query('.bottom-container')
  private _bottomContainer: HTMLElement | undefined;

  @state()
  private _isZooming = false;

  @state()
  private _zoomingX = 1;

  @state()
  private _zoomingY = 1;

  @state()
  private _hoveredAnnotColor: string | null = null;

  @state()
  private _hoveredAnnotColorSide: Side | null = null;

  private _mouseClientX: number = -1;

  private _mouseClientY: number = -1;

  private _isMouseHovering = false;

  constructor() {
    super();

    this.addEventListener('wheel', this._handleWheel.bind(this), {
      capture: true,
    });

    this.addEventListener('mouseenter', this._handleMouseEnter.bind(this));
    this.addEventListener('mouseleave', this._handleMouseLeave.bind(this));

    window.addEventListener('mousemove', this._handleMouseMove.bind(this), {
      passive: true,
    });

    window.addEventListener('keydown', this._handleControlDown.bind(this));
    window.addEventListener('keyup', this._handleControlUp.bind(this));
  }

  render(): HTMLTemplateResult {
    this._setComputedStyleProps();

    return html`
      ${this._renderHeatmap()}
      ${this._renderSides()}
      ${
        this._hoveredAnnotColor && !this._isZooming
          ? this._renderColorAnnotTooltip()
          : ''
      }
      ${this._isZooming ? this._renderZoomTooltip() : ''}
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

  private _renderZoomTooltip(): HTMLTemplateResult {
    return html`
      <div class="zoom-overlay"></div>
      <div class="tooltip zoom-tooltip">
        <div class="zoom-y-text">
          Vertical zoom: ${Math.round(this._zoomingY * 100)}%
        </div>
        <div class="zoom-x-text">
          Horizontal zoom: ${Math.round(this._zoomingX * 100)}%
        </div>
      </div>
    `;
  }

  private _renderColorAnnotTooltip(): HTMLTemplateResult {
    const color = this._hoveredAnnotColor;
    const side = this._hoveredAnnotColorSide;

    if (!color || !side) {
      return html``;
    }

    const colorAnnotSideLabels = this.colorAnnotLabels[side];

    if (!colorAnnotSideLabels) {
      return html``;
    }

    if (!colorAnnotSideLabels[color]) {
      return html``;
    }

    return html`
      <div class="tooltip">
        ${colorAnnotSideLabels[color]}
      </div>
    `;
  }

  private _renderHeatmap(): HTMLTemplateResult {
    return html`
      <div 
        class="heatmap"
        @scroll="${this._handleHeatmapScroll}"
      >
        <biowc-heatmap-heatmap
          .data=${this.data}
          .color=${this.color}
          .selectedRows=${this.selectedRows}
          .selectedCols=${this.selectedCols}
          @biowc-heatmap-cell-hover=${this._handleCellHover}
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
                  .hoveredIndices=${hoveredIndices}
                  .selectedIndices=${selectedIndices}
                  @biowc-heatmap-side-select=
                    ${this._handleSelect(horizontal)}
                  @biowc-heatmap-side-hover=
                    ${this._handleHover(horizontal)}
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
                  @biowc-heatmap-side-hover=${this._handleHover(horizontal)}
                  @biowc-heatmap-side-select=${this._handleSelect(horizontal)}
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
                  .hoveredIndices=${hoveredIndices}
                  .selectedIndices=${selectedIndices}
                  @biowc-heatmap-side-hover=${this._handleHover(horizontal)}
                  @biowc-heatmap-side-select=${this._handleSelect(horizontal)}
                  @biowc-heatmap-annot-color-hover=${
                    this._handleColorAnnotHover
                  }
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

  private _handleMouseEnter() {
    this._isMouseHovering = true;
  }

  private _handleMouseLeave() {
    this._isMouseHovering = false;
  }

  private _handleControlDown(event: KeyboardEvent) {
    if (event.key === 'Control' && this._isMouseHovering) {
      if (!this._isZooming) {
        this.classList.add('zooming');
        this._isZooming = true;
        this._zoomingX = this.zoomX;
        this._zoomingY = this.zoomY;
      }
    }
  }

  private _handleControlUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.classList.remove('zooming');
      this._isZooming = false;
      this.zoomX = this._zoomingX;
      this.zoomY = this._zoomingY;
    }
  }

  private _handleWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const deltaZoomFactor =
        event.deltaY < 0 ? this.zoomFactor : 1 / this.zoomFactor;

      if (event.shiftKey) {
        this._zoomingX = Math.max(1, this._zoomingX * deltaZoomFactor);
      } else {
        this._zoomingY = Math.max(1, this._zoomingY * deltaZoomFactor);
      }
    }
  }

  private _handleMouseMove(event: MouseEvent) {
    this._mouseClientX = event.clientX;
    this._mouseClientY = event.clientY;

    this.style.setProperty(
      '--biowc-heatmap-tooltip-top',
      `${this._mouseClientY}px`
    );

    this.style.setProperty(
      '--biowc-heatmap-tooltip-left',
      `${this._mouseClientX}px`
    );
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

  private _handleColorAnnotHover(event: ColorHoverEvent) {
    this._hoveredAnnotColor = event.detail.color;
    this._hoveredAnnotColorSide = event.detail.side;
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
