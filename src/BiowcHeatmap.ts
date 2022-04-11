import { svg, css, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export enum Side {
  top = 'top',
  left = 'left',
  right = 'right',
  bottom = 'bottom',
}

export type Labels = {
  [key in Side]?: string[];
};

export type SideSizes = {
  [key in Side]: number;
};

export class BiowcHeatmap extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .heatmap-background {
      fill: var(--heatmap-background-color, rgba(1, 1, 1, 0));
    }

    .label-box {
      fill: var(--label-background-color, rgba(1, 1, 1, 0));
    }

    .label-text {
      fill: var(--label-text-color, #222222);
      font-family: var(--label-text-font-family, sans-serif);
    }
  `;

  @property({ type: String })
  color: String = '#b40000';

  @property({ type: Number })
  gutter: number = 0.05;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  labels: Labels = {};

  @property({ attribute: false })
  labelSizes: SideSizes = {
    top: 0.1,
    left: 0.1,
    right: 0.1,
    bottom: 0.1,
  };

  @property({ attribute: false })
  heatmapMargins: SideSizes = {
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
  };

  __validateProps() {
    for (const side of Object.values(Side)) {
      const labels = this.labels[side] ?? [];

      if (
        labels.length !== 0 &&
        (((side === Side.top || side === Side.bottom) &&
          labels.length !== this.__nCols()) ||
          ((side === Side.left || side === Side.right) &&
            labels.length !== this.__nRows()))
      ) {
        // eslint-disable-next-line no-console
        console.error(
          `Labels for ${side} side must be the same length as the data`
        );
      }
    }
  }

  __nRows() {
    return this.data.length;
  }

  __nCols() {
    if (this.__nRows() === 0) {
      return 0;
    }
    return this.data[0].length;
  }

  __hasLabels(side: Side): boolean {
    const labels = this.labels[side] ?? [];

    if (side === Side.top || side === Side.bottom) {
      return labels.length === this.__nCols();
    }

    if (side === Side.left || side === Side.right) {
      return labels.length === this.__nRows();
    }

    return false;
  }

  __labelSize(side: Side): number {
    if (side === Side.top || side === Side.bottom) {
      return this.labelSizes[side] * this.__nRows();
    }

    if (side === Side.left || side === Side.right) {
      return this.labelSizes[side] * this.__nCols();
    }

    return 0;
  }

  __viewboxWidth(): number {
    let width = this.__nCols();

    width += this.heatmapMargins.left + this.heatmapMargins.right;

    for (const side of [Side.left, Side.right]) {
      if (this.__hasLabels(side)) {
        width += this.__labelSize(side);
      }
    }

    return width;
  }

  __viewboxHeight(): number {
    let height = this.__nRows();

    height += this.heatmapMargins.top + this.heatmapMargins.bottom;

    for (const side of [Side.top, Side.bottom]) {
      if (this.__hasLabels(side)) {
        height += this.__labelSize(side);
      }
    }

    return height;
  }

  __heatmapXoffset(): number {
    let xoffset = 0;

    xoffset += this.heatmapMargins.left;

    if (this.__hasLabels(Side.left)) {
      xoffset += this.__labelSize(Side.left);
    }

    return xoffset;
  }

  __heatmapYoffset(): number {
    let yoffset = 0;

    yoffset += this.heatmapMargins.top;

    if (this.__hasLabels(Side.top)) {
      yoffset += this.__labelSize(Side.top);
    }

    return yoffset;
  }

  __labelsXoffset(side: Side): number {
    if (side === Side.left) {
      return 0;
    }

    if (side === Side.right) {
      let xoffset = this.__heatmapXoffset();

      xoffset += this.__nCols();
      xoffset += this.heatmapMargins.right;

      return xoffset;
    }

    if (side === Side.top || side === Side.bottom) {
      let xoffset = this.heatmapMargins.left;

      if (this.__hasLabels(Side.left)) {
        xoffset += this.__labelSize(Side.left);
      }

      return xoffset;
    }

    return 0;
  }

  __labelsYoffset(side: Side): number {
    if (side === Side.top) {
      return 0;
    }

    if (side === Side.bottom) {
      let yoffset = this.__heatmapYoffset();

      yoffset += this.__nRows();
      yoffset += this.heatmapMargins.bottom;

      return yoffset;
    }

    if (side === Side.left || side === Side.right) {
      let yoffset = this.heatmapMargins.top;

      if (this.__hasLabels(Side.top)) {
        yoffset += this.__labelSize(Side.top);
      }

      return yoffset;
    }

    return 0;
  }

  updated() {
    this.__validateProps();
  }

  renderHeatmapCell(x: number, y: number, value: number): SVGTemplateResult {
    return svg`
      <rect
        x="${x}"
        y="${y}"
        width="${1 - this.gutter}"
        height="${1 - this.gutter}"
        fill="${this.color}"
        opacity="${value}"/>
    `;
  }

  renderHeatmapRow(row: Array<number>, y: number): SVGTemplateResult {
    return svg`${row.map((value, x) => this.renderHeatmapCell(x, y, value))}`;
  }

  renderHeatmap(): SVGTemplateResult {
    return svg`
      <svg
        x="${this.__heatmapXoffset()}"
        y="${this.__heatmapYoffset()}"
        class="heatmap"
      >
        <rect
          x="0"
          y="0"
          width="${this.__nCols()}"
          height="${this.__nRows()}"
          class="heatmap-background"
        />
        ${this.data.map((row, i) => this.renderHeatmapRow(row, i))}
      </svg>
    `;
  }

  renderLabels(side: Side): SVGTemplateResult {
    const rotation = (s: Side): number => {
      if (s === Side.top || s === Side.bottom) {
        return -90;
      }
      return 0;
    };

    const translation = (s: Side): number => {
      if (s === Side.top || s === Side.bottom) {
        return -this.__labelSize(s);
      }
      return 0;
    };

    const textAnchor = {
      top: 'start',
      left: 'end',
      right: 'start',
      bottom: 'end',
    };

    const textOffset = 4.5 * this.gutter;

    const fontSize = 1 - textOffset;

    const textTranslation = (s: Side) => {
      if (s === Side.left || s === Side.bottom) {
        return this.__labelSize(s) - textOffset;
      }

      return textOffset;
    };

    if (this.__hasLabels(side)) {
      return svg`
        <svg
          x="${this.__labelsXoffset(side)}"
          y="${this.__labelsYoffset(side)}"
          class="labels-${side}"
        >
          <g
            transform="
              rotate(${rotation(side)})
              translate(${translation(side)}, 0)
            "
          >
            ${this.labels[side]?.map(
              (label, y) =>
                svg`
                  <rect
                    x="0"
                    y="${y + this.gutter}"
                    width="${this.__labelSize(side)}"
                    height="${1 - this.gutter}"
                    class="label-box"
                  />
                  <text
                    font-size="${fontSize}"
                    text-anchor="${textAnchor[side]}"
                    transform="translate(
                      ${textTranslation(side)},
                      ${y + 1 - textOffset}
                    )"
                    class="label-text"
                  >
                      ${label}
                  </text>
                `
            )}
          </g>
        </svg>
      `;
    }

    return svg``;
  }

  render(): SVGTemplateResult {
    return svg`
      <svg
        version="1.1"
        viewBox="0 0 ${this.__viewboxWidth()} ${this.__viewboxHeight()}"
      >
        ${this.renderLabels(Side.top)}
        ${this.renderLabels(Side.left)}
        ${this.renderHeatmap()}
        ${this.renderLabels(Side.right)}
        ${this.renderLabels(Side.bottom)}
      </svg>
    `;
  }
}
