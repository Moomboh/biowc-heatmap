import { html, svg, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class AdvancedHeatmap extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--advanced-heatmap-text-color, #000);
    }
  `;

  @property({ type: String })
  color: String = '#ff0000';

  @property({ type: Number })
  gutter: number = 0.05;

  @property({ attribute: false })
  data: Array<Array<Number>> = [];

  __nRows() {
    return this.data.length;
  }

  __nCols() {
    if (this.__nRows() === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  renderRow(row: Array<Number>, y: Number) {
    return svg`${row.map(
      (value, i) => svg`
      <rect
        x="${i}"
        y="${y}"
        width="${1 - this.gutter}"
        height="${1 - this.gutter}"
        fill="${this.color}"
        opacity="${value}"/>
      `
    )}`;
  }

  render() {
    return html`
      <svg version="1.1" viewBox="0 0 ${this.__nCols()} ${this.__nRows()}">
        ${this.data.map((row, i) => this.renderRow(row, i))}
      </svg>
    `;
  }
}
