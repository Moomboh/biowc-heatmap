import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { colorScale } from './util/colors.js';
import styles from './biowc-heatmap-heatmap.css.js';

export class BiowcHeatmapHeatmap extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  color: string = '#b40000';

  render(): SVGTemplateResult {
    const scale = colorScale(this.color);

    return svg`
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 ${this._nCols} ${this._nRows}"
      >
        ${this.data.map(
          (row, y) => svg`
          ${row.map(
            (value, x) => svg`
            <rect
              x="${x}"
              y="${y}"
              width="1"
              height="1"
              fill="${scale(value)}"
            />`
          )}`
        )}
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
}
