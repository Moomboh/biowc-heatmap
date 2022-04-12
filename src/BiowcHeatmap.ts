import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap.css.js';

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
  static styles = styles;

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

  _zoom: number = 1;

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
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

  get _zoomXoffset() {
    return -(this._nCols / 2) * (1 - 1 / this._zoom);
  }

  get _zoomYoffset() {
    return -(this._nRows / 2) * (1 - 1 / this._zoom);
  }

  get _viewboxWidth(): number {
    let width = this._nCols;

    width += this.heatmapMargins.left + this.heatmapMargins.right;

    for (const side of [Side.left, Side.right]) {
      if (this._hasLabels(side)) {
        width += this._labelSize(side);
      }
    }

    return width;
  }

  get _viewboxHeight(): number {
    let height = this._nRows;

    height += this.heatmapMargins.top + this.heatmapMargins.bottom;

    for (const side of [Side.top, Side.bottom]) {
      if (this._hasLabels(side)) {
        height += this._labelSize(side);
      }
    }

    return height;
  }

  get _heatmapXoffset(): number {
    let xoffset = 0;

    xoffset += this.heatmapMargins.left;

    if (this._hasLabels(Side.left)) {
      xoffset += this._labelSize(Side.left);
    }

    return xoffset;
  }

  get _heatmapYoffset(): number {
    let yoffset = 0;

    yoffset += this.heatmapMargins.top;

    if (this._hasLabels(Side.top)) {
      yoffset += this._labelSize(Side.top);
    }

    return yoffset;
  }

  _labelsXoffset(side: Side): number {
    if (side === Side.left) {
      return 0;
    }

    if (side === Side.right) {
      let xoffset = this._heatmapXoffset;

      xoffset += this._nCols;
      xoffset += this.heatmapMargins.right;

      return xoffset;
    }

    if (side === Side.top || side === Side.bottom) {
      let xoffset = this.heatmapMargins.left;

      if (this._hasLabels(Side.left)) {
        xoffset += this._labelSize(Side.left);
      }

      return xoffset;
    }

    return 0;
  }

  _labelsYoffset(side: Side): number {
    if (side === Side.top) {
      return 0;
    }

    if (side === Side.bottom) {
      let yoffset = this._heatmapYoffset;

      yoffset += this._nRows;
      yoffset += this.heatmapMargins.bottom;

      return yoffset;
    }

    if (side === Side.left || side === Side.right) {
      let yoffset = this.heatmapMargins.top;

      if (this._hasLabels(Side.top)) {
        yoffset += this._labelSize(Side.top);
      }

      return yoffset;
    }

    return 0;
  }

  _hasLabels(side: Side): boolean {
    const labels = this.labels[side] ?? [];

    if (side === Side.top || side === Side.bottom) {
      return labels.length === this._nCols;
    }

    if (side === Side.left || side === Side.right) {
      return labels.length === this._nRows;
    }

    return false;
  }

  _labelSize(side: Side): number {
    if (side === Side.top || side === Side.bottom) {
      return this.labelSizes[side] * this._nRows;
    }

    if (side === Side.left || side === Side.right) {
      return this.labelSizes[side] * this._nCols;
    }

    return 0;
  }

  _onWheel(event: WheelEvent) {
    if (event.ctrlKey === true) {
      event.preventDefault();

      const maxZoom = 4;
      const scale = 0.001;
      const delta = event.deltaY;

      this._zoom += delta * -scale;

      this._zoom = Math.min(Math.max(1, this._zoom), maxZoom);

      this.requestUpdate();
    }
  }

  _validateProps() {
    for (const side of Object.values(Side)) {
      const labels = this.labels[side] ?? [];

      if (
        labels.length !== 0 &&
        (((side === Side.top || side === Side.bottom) &&
          labels.length !== this._nCols) ||
          ((side === Side.left || side === Side.right) &&
            labels.length !== this._nRows))
      ) {
        // eslint-disable-next-line no-console
        console.error(
          `Labels for ${side} side must be the same length as the data`
        );
      }
    }
  }

  updated() {
    this._validateProps();
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
        x="${this._heatmapXoffset}"
        y="${this._heatmapYoffset}"
        width="${this._nCols}"
        height="${this._nRows}"
        class="heatmap"
      >
        <rect
          x="0"
          y="0"
          width="${this._nCols}"
          height="${this._nRows}"
          class="heatmap-background"
        />
        <g
          transform="
            scale(${this._zoom})
            translate(${this._zoomXoffset}, ${this._zoomYoffset})
          "
        >
          ${this.data.map((row, i) => this.renderHeatmapRow(row, i))}
        </g>
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
        return -this._labelSize(s);
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
        return this._labelSize(s) - textOffset;
      }

      return textOffset;
    };

    const width = (s: Side): number => {
      if (s === Side.left || s === Side.right) {
        return this._labelSize(s);
      }

      return this._nCols;
    };

    const height = (s: Side): number => {
      if (s === Side.top || s === Side.bottom) {
        return this._labelSize(s);
      }

      return this._nRows;
    };

    const zoomLabelSizeoffset = -this._labelSize(side) * (1 - 1 / this._zoom);

    const zoomXoffset = (s: Side): number => {
      if (s === Side.left) {
        return zoomLabelSizeoffset;
      }

      if (s === Side.right) {
        return 0;
      }

      return this._zoomXoffset;
    };

    const zoomYoffset = (s: Side): number => {
      if (s === Side.top) {
        return zoomLabelSizeoffset;
      }

      if (s === Side.bottom) {
        return 0;
      }

      return this._zoomYoffset;
    };

    if (this._hasLabels(side)) {
      return svg`
        <svg
          x="${this._labelsXoffset(side)}"
          y="${this._labelsYoffset(side)}"
          width="${width(side)}"
          height="${height(side)}"
          class="labels-${side}"
        >
          <g
            transform="
              scale(${this._zoom})
              translate(${zoomXoffset(side)}, ${zoomYoffset(side)})
            "
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
                      width="${this._labelSize(side)}"
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
        viewBox="0 0 ${this._viewboxWidth} ${this._viewboxHeight}"
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
