import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { colorScale } from './util/colors.js';
import styles from './biowc-heatmap-heatmap.css.js';
import { computed } from './util/computedDecorator.js';

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
          ${row.map((value, x) => {
            if (value > 0) {
              return svg`
                <rect
                  @mouseover=${this._onHoverCell}
                  @mouseleave=${this._onMouseLeave}
                  x="${x}"
                  y="${y}"
                  width="1"
                  height="1"
                  fill="${scale(value)}"
                  class="cell"
                />`;
            }

            return svg``;
          })}`
        )}
      </svg>
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

  private _onHoverCell(event: Event) {
    const target = event.target as SVGRectElement;

    const cellHoverEvent = new CustomEvent('biowc-heatmap-cell-hover', {
      detail: {
        x: target?.x.baseVal.value,
        y: target?.y.baseVal.value,
      },
    });

    this.dispatchEvent(cellHoverEvent);
  }

  private _onMouseLeave() {
    const cellHoverEvent = new CustomEvent('biowc-heatmap-cell-hover', {
      detail: {
        x: null,
        y: null,
      },
    });

    this.dispatchEvent(cellHoverEvent);
  }
}
