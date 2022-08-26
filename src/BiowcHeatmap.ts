import { html, LitElement, HTMLTemplateResult, render, svg } from 'lit';
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
import { BiowcHeatmapLegend } from './BiowcHeatmapLegend.js';

export const DEFAULT_SVG_FONT_SIZE = 16;
export const DEFAULT_SVG_CELL_WIDTH = 16;
export const DEFAULT_SVG_CELL_HEIGHT = 16;
export const DEFAULT_SVG_AXIS_LABEL_HEIGHT = 2.5 * DEFAULT_SVG_FONT_SIZE;
export const DEFAULT_SVG_COLOR_ANNOT_HEIGHT = 12;
export const DEFAULT_SVG_LABELS_HEIGHT = 120;
export const DEFAULT_SVG_DENDROGRAM_HEIGHT = 120;
export const DEFAULT_SVG_LEGEND_WIDTH = 300;
export const DEFAULT_SVG_LEGEND_HEIGHT = 800;
export const DEFAULT_SVG_LEGEND_MARGIN = 50;
export const DEFAULT_SVG_LEGEND_COLOR_SCALE_HEIGHT = 200;
export const DEFAULT_SVG_LEGEND_COLOR_SCALE_GRADIENT_WIDTH = 26;
export const DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_WIDTH = 12;
export const DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_LABEL_WIDTH = 4;
export const DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_LABEL_MARGIN = 4;

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

export type SideNumbersOption = {
  [key in Side]?: number;
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

  @property({ type: Number, attribute: 'dendrogram-min-height-fraction' })
  dendrogramMinHeightFraction = 0.0;

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

  exportSVG(options: {
    cellWidth: number;
    cellHeight: number;
    axisLabelHeights: SideNumbersOption;
    dendrogramHeights: SideNumbersOption;
    labelsHeights: SideNumbersOption;
    colorAnnotHeights: SideNumbersOption;
    legendColorScaleTitle: string;
    legendWidth: number;
    legendHeight: number;
    legendMargin: number;
    legendFormatColorTick: (value: number) => string;
    fontSize: number;
  }) {
    const defaults = {
      cellWidth: DEFAULT_SVG_CELL_WIDTH,
      cellHeight: DEFAULT_SVG_CELL_HEIGHT,
      axisLabelHeights: {} as SideNumbersOption,
      dendrogramHeights: {} as SideNumbersOption,
      labelsHeights: {} as SideNumbersOption,
      colorAnnotHeights: {} as SideNumbersOption,
      legendColorScaleTitle: '',
      legendWidth: DEFAULT_SVG_LEGEND_WIDTH,
      legendHeight: DEFAULT_SVG_LEGEND_HEIGHT,
      legendMargin: DEFAULT_SVG_LEGEND_MARGIN,
      legendFormatColorTick: undefined,
      fontSize: DEFAULT_SVG_FONT_SIZE,
    };

    // eslint-disable-next-line no-param-reassign
    options = { ...defaults, ...options };

    const {
      cellWidth,
      cellHeight,
      axisLabelHeights,
      dendrogramHeights,
      labelsHeights,
      colorAnnotHeights,
      legendColorScaleTitle,
      legendWidth,
      legendHeight,
      legendMargin,
      legendFormatColorTick,
      fontSize,
    } = options;

    function determineSideHeights(
      sideHeights: SideNumbersOption,
      hasSide: SideBooleans,
      defaultHeight: number
    ) {
      return Object.fromEntries(
        SIDES.map(side => {
          if (sideHeights[side] !== undefined) {
            return [side, sideHeights[side]];
          }
          return [side, hasSide[side] ? defaultHeight : 0];
        })
      ) as SideNumbers;
    }

    const dendrogramH = determineSideHeights(
      dendrogramHeights,
      this._hasSideDendrogram,
      DEFAULT_SVG_DENDROGRAM_HEIGHT
    );

    const axisLabelH = determineSideHeights(
      axisLabelHeights,
      this._hasSideAxisLabel,
      DEFAULT_SVG_AXIS_LABEL_HEIGHT
    );

    const labelsH = determineSideHeights(
      labelsHeights,
      this._hasSideLabels,
      DEFAULT_SVG_LABELS_HEIGHT
    );

    const colorAnnotH = determineSideHeights(
      colorAnnotHeights,
      this._hasSideColorAnnots,
      DEFAULT_SVG_COLOR_ANNOT_HEIGHT
    );

    const width =
      axisLabelH.left +
      dendrogramH.left +
      labelsH.left +
      colorAnnotH.left +
      this._nCols * cellWidth +
      colorAnnotH.right +
      labelsH.right +
      dendrogramH.right +
      axisLabelH.right +
      legendMargin +
      legendWidth;

    const height = Math.max(
      this._nRows * cellHeight +
        axisLabelH.top +
        dendrogramH.top +
        labelsH.top +
        colorAnnotH.top +
        colorAnnotH.bottom +
        labelsH.bottom +
        dendrogramH.bottom +
        axisLabelH.bottom,
      legendHeight +
        axisLabelH.top +
        dendrogramH.top +
        labelsH.top +
        colorAnnotH.top
    );

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgEl.setAttribute('width', `${width}`);
    svgEl.setAttribute('height', `${height}`);
    svgEl.setAttribute('height', `${height}`);

    // TOP
    const topXOfsset =
      axisLabelH.left + dendrogramH.left + labelsH.left + colorAnnotH.left;

    const topAxisLabelSVG = this._getAxisLabelSVG(
      Side.top,
      axisLabelH.top,
      cellWidth,
      cellHeight,
      1.5 * fontSize
    );

    if (topAxisLabelSVG && axisLabelH[Side.top]) {
      topAxisLabelSVG.setAttribute('x', `${topXOfsset}`);
      topAxisLabelSVG.setAttribute('y', '0');
      svgEl.append(topAxisLabelSVG);
    }

    const topDendrogramSVG = (
      this._topContainer?.querySelector('biowc-heatmap-dendrogram') as
        | BiowcHeatmapDendrogram
        | null
        | undefined
    )?.exportSVG(dendrogramH.top, cellWidth, cellHeight);

    if (topDendrogramSVG && dendrogramH[Side.top]) {
      topDendrogramSVG.setAttribute('x', `${topXOfsset}`);
      topDendrogramSVG.setAttribute('y', `${axisLabelH.top}`);
      svgEl.append(topDendrogramSVG);
    }

    const topLabelsSVG = (
      this._topContainer?.querySelector('biowc-heatmap-labels') as
        | BiowcHeatmapLabels
        | null
        | undefined
    )?.exportSVG(labelsH.top, cellWidth, cellHeight, fontSize);

    if (topLabelsSVG && labelsH[Side.top]) {
      topLabelsSVG.setAttribute('x', `${topXOfsset}`);
      topLabelsSVG.setAttribute('y', `${axisLabelH.top + dendrogramH.top}`);
      svgEl.append(topLabelsSVG);
    }

    const topColorAnnotSVG = (
      this._topContainer?.querySelector('biowc-heatmap-color-annot') as
        | BiowcHeatmapColorAnnot
        | null
        | undefined
    )?.exportSVG(colorAnnotH.top, cellWidth, cellHeight);

    if (topColorAnnotSVG && colorAnnotH[Side.top]) {
      topColorAnnotSVG.setAttribute('x', `${topXOfsset}`);
      topColorAnnotSVG.setAttribute(
        'y',
        `${axisLabelH.top + dendrogramH.top + labelsH.top}`
      );
      svgEl.append(topColorAnnotSVG);
    }

    // LEFT
    const leftYOffset =
      axisLabelH.top + dendrogramH.top + labelsH.top + colorAnnotH.top;

    const leftAxisLabelSVG = this._getAxisLabelSVG(
      Side.left,
      axisLabelH.left,
      cellWidth,
      cellHeight,
      1.5 * fontSize
    );

    if (leftAxisLabelSVG && axisLabelH[Side.left]) {
      leftAxisLabelSVG.setAttribute('x', '0');
      leftAxisLabelSVG.setAttribute('y', `${leftYOffset}`);
      svgEl.append(leftAxisLabelSVG);
    }

    const leftDendrogramSVG = (
      this._leftContainer?.querySelector('biowc-heatmap-dendrogram') as
        | BiowcHeatmapDendrogram
        | null
        | undefined
    )?.exportSVG(dendrogramH.left, cellWidth, cellHeight);

    if (leftDendrogramSVG && dendrogramH[Side.left]) {
      leftDendrogramSVG.setAttribute('x', `${axisLabelH.left}`);
      leftDendrogramSVG.setAttribute('y', `${leftYOffset}`);
      svgEl.append(leftDendrogramSVG);
    }

    const leftLabelsSVG = (
      this._leftContainer?.querySelector('biowc-heatmap-labels') as
        | BiowcHeatmapLabels
        | null
        | undefined
    )?.exportSVG(labelsH.left, cellWidth, cellHeight, fontSize);

    if (leftLabelsSVG && labelsH[Side.left]) {
      leftLabelsSVG.setAttribute('x', `${axisLabelH.left + dendrogramH.left}`);
      leftLabelsSVG.setAttribute('y', `${leftYOffset}`);
      svgEl.append(leftLabelsSVG);
    }
    const leftColorAnnotSVG = (
      this._leftContainer?.querySelector('biowc-heatmap-color-annot') as
        | BiowcHeatmapColorAnnot
        | null
        | undefined
    )?.exportSVG(colorAnnotH.left, cellWidth, cellHeight);

    if (leftColorAnnotSVG && colorAnnotH[Side.left]) {
      leftColorAnnotSVG.setAttribute(
        'x',
        `${axisLabelH.left + dendrogramH.left + labelsH.left}`
      );
      leftColorAnnotSVG.setAttribute('y', `${leftYOffset}`);
      svgEl.append(leftColorAnnotSVG);
    }

    // HEATMAP
    const heatmapSVG = (
      this._heatmap as BiowcHeatmapHeatmap | undefined
    )?.exportSVG(cellWidth, cellHeight);

    if (heatmapSVG) {
      heatmapSVG.setAttribute('x', `${topXOfsset}`);
      heatmapSVG.setAttribute('y', `${leftYOffset}`);
      svgEl.append(heatmapSVG);
    }

    // RIGHT
    const rightYOffset = leftYOffset;
    const rightXOffset = topXOfsset + cellWidth * this._nCols;

    const rightColorAnnotSVG = (
      this._rightContainer?.querySelector('biowc-heatmap-color-annot') as
        | BiowcHeatmapColorAnnot
        | null
        | undefined
    )?.exportSVG(colorAnnotH.right, cellWidth, cellHeight);

    if (rightColorAnnotSVG && colorAnnotH[Side.right]) {
      rightColorAnnotSVG.setAttribute('x', `${rightXOffset}`);
      rightColorAnnotSVG.setAttribute('y', `${rightYOffset}`);
      svgEl.append(rightColorAnnotSVG);
    }

    const rightLabelsSVG = (
      this._rightContainer?.querySelector('biowc-heatmap-labels') as
        | BiowcHeatmapLabels
        | null
        | undefined
    )?.exportSVG(labelsH.right, cellWidth, cellHeight, fontSize);

    if (rightLabelsSVG && labelsH[Side.right]) {
      rightLabelsSVG.setAttribute('x', `${rightXOffset + colorAnnotH.right}`);
      rightLabelsSVG.setAttribute('y', `${rightYOffset}`);
      svgEl.append(rightLabelsSVG);
    }

    const rightDendrogramSVG = (
      this._rightContainer?.querySelector('biowc-heatmap-dendrogram') as
        | BiowcHeatmapDendrogram
        | null
        | undefined
    )?.exportSVG(dendrogramH.right, cellWidth, cellHeight);

    if (rightDendrogramSVG && dendrogramH[Side.right]) {
      rightDendrogramSVG.setAttribute(
        'x',
        `${rightXOffset + colorAnnotH.right + labelsH.right}`
      );
      rightDendrogramSVG.setAttribute('y', `${rightYOffset}`);
      svgEl.append(rightDendrogramSVG);
    }

    const rightAxisLabelSVG = this._getAxisLabelSVG(
      Side.right,
      axisLabelH.right,
      cellWidth,
      cellHeight,
      1.5 * fontSize
    );

    if (rightAxisLabelSVG && axisLabelH[Side.right]) {
      rightAxisLabelSVG.setAttribute(
        'x',
        `${
          rightXOffset + colorAnnotH.right + labelsH.right + dendrogramH.right
        }`
      );
      rightAxisLabelSVG.setAttribute('y', `${rightYOffset}`);
      svgEl.append(rightAxisLabelSVG);
    }

    // BOTTOM
    const bottomXOffset = topXOfsset;
    const bottomYOffset = leftYOffset + cellHeight * this._nRows;

    const bottomColorAnnotSVG = (
      this._bottomContainer?.querySelector('biowc-heatmap-color-annot') as
        | BiowcHeatmapColorAnnot
        | null
        | undefined
    )?.exportSVG(colorAnnotH.bottom, cellWidth, cellHeight);

    if (bottomColorAnnotSVG && colorAnnotH[Side.bottom]) {
      bottomColorAnnotSVG.setAttribute('x', `${bottomXOffset}`);
      bottomColorAnnotSVG.setAttribute('y', `${bottomYOffset}`);
      svgEl.append(bottomColorAnnotSVG);
    }

    const bottomLabelsSVG = (
      this._bottomContainer?.querySelector('biowc-heatmap-labels') as
        | BiowcHeatmapLabels
        | null
        | undefined
    )?.exportSVG(labelsH.bottom, cellWidth, cellHeight, fontSize);

    if (bottomLabelsSVG && labelsH[Side.bottom]) {
      bottomLabelsSVG.setAttribute('x', `${bottomXOffset}`);
      bottomLabelsSVG.setAttribute(
        'y',
        `${bottomYOffset + colorAnnotH.bottom}`
      );
      svgEl.append(bottomLabelsSVG);
    }

    const bottomDendrogramSVG = (
      this._bottomContainer?.querySelector('biowc-heatmap-dendrogram') as
        | BiowcHeatmapDendrogram
        | null
        | undefined
    )?.exportSVG(dendrogramH.bottom, cellWidth, cellHeight);

    if (bottomDendrogramSVG && dendrogramH[Side.bottom]) {
      bottomDendrogramSVG.setAttribute('x', `${bottomXOffset}`);
      bottomDendrogramSVG.setAttribute(
        'y',
        `${bottomYOffset + colorAnnotH.bottom + labelsH.bottom}`
      );
      svgEl.append(bottomDendrogramSVG);
    }

    const bottomAxisLabelSVG = this._getAxisLabelSVG(
      Side.bottom,
      axisLabelH.bottom,
      cellWidth,
      cellHeight,
      1.5 * fontSize
    );

    if (bottomAxisLabelSVG && axisLabelH[Side.bottom]) {
      bottomAxisLabelSVG.setAttribute('x', `${bottomXOffset}`);
      bottomAxisLabelSVG.setAttribute(
        'y',
        `${
          bottomYOffset +
          colorAnnotH.bottom +
          labelsH.bottom +
          dendrogramH.bottom
        }`
      );
      svgEl.append(bottomAxisLabelSVG);
    }

    // LEGEND
    const legendXOffset = width - legendWidth;
    const legendYOffset = rightYOffset;

    const legend = new BiowcHeatmapLegend();
    legend.forHeatmap = this;
    legend.colorScaleTitle = legendColorScaleTitle;

    if (legendFormatColorTick) {
      legend.formatColorTick = legendFormatColorTick;
    }

    const legendSVG = legend.exportSVG(
      legendWidth,
      legendHeight,
      undefined,
      undefined,
      fontSize
    );

    if (legendSVG && legendHeight && legendWidth) {
      legendSVG.setAttribute('x', `${legendXOffset}`);
      legendSVG.setAttribute('y', `${legendYOffset}`);
      svgEl.append(legendSVG);
    }

    return svgEl;
  }

  private _getAxisLabelSVG(
    side: Side,
    height = DEFAULT_SVG_AXIS_LABEL_HEIGHT,
    cellWidth = DEFAULT_SVG_CELL_WIDTH,
    cellHeight = DEFAULT_SVG_CELL_HEIGHT,
    fontSize = 1.5 * DEFAULT_SVG_FONT_SIZE
  ) {
    if (!this.axisLabels[side]) {
      return null;
    }

    const tempContainerEl = document.createElement('div');
    const isHorizontal = side === 'top' || side === 'bottom';
    const svgWidth = isHorizontal ? this._nCols * cellWidth : height;
    const svgHeight = isHorizontal ? height : this._nRows * cellHeight;

    render(
      svg`
        <svg width="${svgWidth}" height="${svgHeight}">
          <text
            x="50%"
            y="50%"
            style="font: ${fontSize}px sans-serif;"
            text-anchor="middle"
            dominant-baseline="middle"
            transform="${
              isHorizontal
                ? ''
                : `rotate(-90) translate(-${svgHeight / 2}, -${
                    svgHeight / 2 - svgWidth / 2
                  })`
            }"
          >
            ${this.axisLabels[side]}
          </text>
        </svg>
    `,
      tempContainerEl
    );

    return tempContainerEl.firstElementChild as SVGSVGElement;
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
                  min-height-fraction=${this.dendrogramMinHeightFraction}
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
    ) as SideBooleans;
  }

  @computed('dendrograms')
  private get _hasSideDendrogram() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.dendrograms[side]])
    ) as SideBooleans;
  }

  @computed('colorAnnots')
  private get _hasSideColorAnnots() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.colorAnnots[side]])
    ) as SideBooleans;
  }

  @computed('axisLabels')
  private get _hasSideAxisLabel() {
    return Object.fromEntries(
      Object.values(Side).map(side => [side, !!this.axisLabels[side]])
    ) as SideBooleans;
  }

  // TODO: Check if axis labels are shown and refactor to deduplicate above code
  @computed(
    '_hasSideLabels',
    '_hasSideDendrogram',
    '_hasSideColorAnnots',
    '_hasSideAxisLabels'
  )
  private get _hasSide() {
    return Object.fromEntries(
      Object.values(Side).map(side => [
        side,
        this._hasSideLabels[side] ||
          this._hasSideDendrogram[side] ||
          this._hasSideColorAnnots[side] ||
          this._hasSideAxisLabel[side],
      ])
    ) as SideBooleans;
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
