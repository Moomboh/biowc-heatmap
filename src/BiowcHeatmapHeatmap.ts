import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-heatmap.css.js';

export class BiowcHeatmapHeatmap extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ type: Number })
  gutter: number = 0.02;

  @property({ type: String })
  color: String = '#b40000';

  render(): SVGTemplateResult {
    return svg`
      <svg viewBox="0 0 ${this._nCols} ${this._nRows}">
        <rect
          x="0"
          y="0"
          width="${this._nCols}"
          height="${this._nRows}"
          class="background"
        />
        ${this.data.map((row, i) => this._renderHeatmapRow(row, i))}
      </svg>
    `;
  }

  get _nRows(): number {
    return this.data.length;
  }

  get _nCols(): number {
    if (this._nRows === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  _renderHeatmapCell(x: number, y: number, value: number): SVGTemplateResult {
    return svg`
      <rect
        x="${x + this.gutter}"
        y="${y + this.gutter}"
        width="${1 - this.gutter}"
        height="${1 - this.gutter}"
        fill="${this.color}"
        opacity="${value}"/>
    `;
  }

  _renderHeatmapRow(row: Array<number>, y: number): SVGTemplateResult {
    return svg`${row.map((value, x) => this._renderHeatmapCell(x, y, value))}`;
  }
}
