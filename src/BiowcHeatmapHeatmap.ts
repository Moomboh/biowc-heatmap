import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { colorScale, ColorScaleConfig } from './util/colors.js';
import styles from './biowc-heatmap-heatmap.css.js';
import { computed } from './util/computedDecorator.js';

export type CellHoverEvent = CustomEvent<{
  x: number | null;
  y: number | null;
}>;

export const defaultCellColor = '#b40000';

export const defaultCellColorScale: ColorScaleConfig = {
  colors: ['#ffffff', defaultCellColor],
  values: [0, 1],
};

export class BiowcHeatmapHeatmap extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  cellColorScale: ColorScaleConfig = defaultCellColorScale;

  @property({ attribute: false })
  hoveredRows: Set<number> = new Set();

  @property({ attribute: false })
  hoveredCols: Set<number> = new Set();

  @property({ attribute: false })
  selectedRows: Set<number> = new Set();

  @property({ attribute: false })
  selectedCols: Set<number> = new Set();

  render(): SVGTemplateResult {
    return svg`
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 ${this._nCols} ${this._nRows}"
      >
        ${this._renderCells()}
        ${this._renderOverlays()}
      </svg>
    `;
  }

  private _renderCells(): SVGTemplateResult[] {
    return this.data.map(
      (row, y) => svg`
        ${row.map((value, x) => this._renderCell(x, y, value))})}
      `
    );
  }

  private _renderOverlays(): SVGTemplateResult[] {
    return [
      ...[...this.hoveredRows].map(row =>
        this._renderRowOverlay(row, 'hover-overlay')
      ),
      ...[...this.hoveredCols].map(col =>
        this._renderColOverlay(col, 'hover-overlay')
      ),
      ...[...this.selectedRows].map(row =>
        this._renderRowOverlay(row, 'selected-overlay')
      ),
      ...[...this.selectedCols].map(col =>
        this._renderColOverlay(col, 'selected-overlay')
      ),
    ];
  }

  private _renderCell(x: number, y: number, value: number): SVGTemplateResult {
    return svg`
      <rect
        @mouseover=${this._handleHoverCell}
        @mouseleave=${this._handleMouseLeave}
        x="${x}"
        y="${y}"
        width="1"
        height="1"
        fill="${this._colorScale(value)}"
        class="cell"
      />
    `;
  }

  private _renderRowOverlay(row: number, cssClass: string): SVGTemplateResult {
    return svg`
      <rect
        x="0"
        y="${row}"
        width="${this._nCols}"
        height="1"
        class="${cssClass}"
      />
    `;
  }

  private _renderColOverlay(col: number, cssClass: string): SVGTemplateResult {
    return svg`
      <rect
        x="${col}"
        y="0"
        width="1"
        height="${this._nRows}"
        class="${cssClass}"
      />
    `;
  }

  @computed('data')
  private get _nRows(): number {
    return this.data.length;
  }

  @computed('_nRows', '_nCols')
  private get _nCols(): number {
    if (this._nRows === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  @computed('cellColorScale')
  private get _colorScale() {
    return colorScale(this.cellColorScale);
  }

  private _handleHoverCell(event: Event) {
    const target = event.target as SVGRectElement;

    const cellHoverEvent: CellHoverEvent = new CustomEvent(
      'biowc-heatmap-cell-hover',
      {
        detail: {
          x: target?.x.baseVal.value,
          y: target?.y.baseVal.value,
        },
      }
    );

    this.dispatchEvent(cellHoverEvent);
  }

  private _handleMouseLeave() {
    const cellHoverEvent: CellHoverEvent = new CustomEvent(
      'biowc-heatmap-cell-hover',
      {
        detail: {
          x: null,
          y: null,
        },
      }
    );

    this.dispatchEvent(cellHoverEvent);
  }
}
