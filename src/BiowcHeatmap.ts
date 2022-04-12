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

export type SideNumbers = {
  [key in Side]: number;
};

export type SideBooleans = {
  [key in Side]: boolean;
};

export class BiowcHeatmap extends LitElement {
  static styles = styles;

  @property({ type: String })
  color: String = '#b40000';

  @property({ type: Number })
  gutter: number = 0.02;

  @property({ type: Number })
  scrollbarWidth: number = 0.5;

  @property({ type: Number })
  maxZoom: number = 10;

  @property({ attribute: false })
  data: number[][] = [];

  @property({ attribute: false })
  labels: Labels = {};

  @property({ attribute: false })
  labelSizes: SideNumbers = {
    top: 0.1,
    left: 0.1,
    right: 0.1,
    bottom: 0.1,
  };

  @property({ attribute: false })
  heatmapMargins: SideNumbers = {
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
  };

  constructor() {
    super();
    this.addEventListener('wheel', this._onWheel);
    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('mousemove', this._onMouseMove.bind(this));
  }

  updated() {
    this._validateProps();
  }

  render(): SVGTemplateResult {
    return svg`
      <svg
        version="1.1"
        viewBox="0 0 ${this._viewboxWidth} ${this._viewboxHeight}"
      >
        ${this._renderLabels(Side.top)}
        ${this._renderLabels(Side.left)}
        ${this._renderHeatmap()}
        ${this._renderYscrollbar()}
        ${this._renderLabels(Side.right)}
        ${this._renderXscrollbar()}
        ${this._renderLabels(Side.bottom)}
      </svg>
    `;
  }

  set zoom(value: number) {
    this._zoom = Math.min(Math.max(1, value), this.maxZoom);
    this._enforceScrollColBoundary();
    this._enforceScrollRowBoundary();
    this.requestUpdate();
  }

  get zoom(): number {
    return this._zoom;
  }

  set scrollCol(value: number) {
    this._scrollCol = value;
    this._enforceScrollColBoundary();
    this.requestUpdate();
  }

  get scrollCol(): number {
    return this._scrollCol;
  }

  set scrollRow(value: number) {
    this._scrollRow = value;
    this._enforceScrollRowBoundary();
    this.requestUpdate();
  }

  get scrollRow(): number {
    return this._scrollRow;
  }

  scrollToRow(row: number): void {
    this.scrollRow = row - this._zoomYoffset;
  }

  scrollToCol(col: number): void {
    this.scrollCol = col - this._zoomXoffset;
  }

  scrollToCell(row: number, col: number): void {
    this.scrollToRow(row);
    this.scrollToCol(col);
  }

  _zoom: number = 1;

  _scrollCol: number = 0;

  _scrollRow: number = 0;

  _draggingHeatmap: boolean = false;

  _dragginScrollbarX: boolean = false;

  _dragginScrollbarY: boolean = false;

  get _dragging(): boolean {
    return (
      this._draggingHeatmap ||
      this._dragginScrollbarX ||
      this._dragginScrollbarY
    );
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

  get _zoomXoffset(): number {
    return (this._nCols / 2) * (1 - 1 / this._zoom);
  }

  get _scrollXoffset() {
    return this._zoomXoffset + this._scrollCol;
  }

  get _zoomYoffset(): number {
    return (this._nRows / 2) * (1 - 1 / this._zoom);
  }

  get _scrollYoffset() {
    return this._zoomYoffset + this._scrollRow;
  }

  get _scrollbarYwidth(): number {
    return this.scrollbarWidth;
  }

  get _scrollbarYheight(): number {
    return this._nRows * (1 / this._zoom);
  }

  get _scrollbarYxoffset(): number {
    return (
      this._heatmapXoffset +
      this._nCols +
      (this.heatmapMargins.right - this.scrollbarWidth) / 2
    );
  }

  get _scrollbarYyoffset(): number {
    return this._heatmapYoffset + this._scrollYoffset;
  }

  get _scrollbarXwidth(): number {
    return this._nCols * (1 / this._zoom);
  }

  get _scrollbarXheight(): number {
    return this.scrollbarWidth;
  }

  get _scrollbarXxoffset(): number {
    return this._heatmapXoffset + this._scrollXoffset;
  }

  get _scrollbarXyoffset(): number {
    return (
      this._heatmapYoffset +
      this._nRows +
      (this.heatmapMargins.bottom - this.scrollbarWidth) / 2
    );
  }

  get _scrollDeltaXScale(): number {
    return (1 / this.clientWidth) * (this._nCols + this._scrollbarXwidth);
  }

  get _scrollDeltaYScale(): number {
    return (1 / this.clientHeight) * (this._nRows + this._scrollbarYheight);
  }

  get _dragDeltaXScale(): number {
    return this._scrollDeltaXScale * (1 / this._zoom);
  }

  get _dragDeltaYScale(): number {
    return this._scrollDeltaYScale * (1 / this._zoom);
  }

  get _zoomDeltaScale(): number {
    return (
      Math.min(
        (1 / this.clientWidth) * this._nCols,
        (1 / this.clientHeight) * this._nRows
      ) * 0.1
    );
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

  _enforceScrollColBoundary() {
    this._scrollCol = Math.min(
      Math.max(-this._zoomXoffset, this._scrollCol),
      this._zoomXoffset
    );
  }

  _enforceScrollRowBoundary() {
    this._scrollRow = Math.min(
      Math.max(-this._zoomYoffset, this._scrollRow),
      this._zoomYoffset
    );
  }

  _onMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this._draggingHeatmap = false;
      this._dragginScrollbarX = false;
      this._dragginScrollbarY = false;
    }
  }

  _onMouseMove(event: MouseEvent): void {
    if (this._dragging) {
      event.preventDefault();
    }

    if (this._draggingHeatmap) {
      this.scrollRow += -event.movementY * this._dragDeltaYScale;
      this.scrollCol += -event.movementX * this._dragDeltaYScale;
    }

    if (this._dragginScrollbarX) {
      this.scrollCol += event.movementX * this._scrollDeltaXScale;
    }

    if (this._dragginScrollbarY) {
      this.scrollRow += event.movementY * this._scrollDeltaYScale;
    }
  }

  _onHeatmapMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this._draggingHeatmap = true;
    }
  }

  _onScrollbarXMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this._dragginScrollbarX = true;
    }
  }

  _onScrollbarYMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this._dragginScrollbarY = true;
    }
  }

  _onWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey === true) {
      this.zoom += event.deltaY * -this._zoomDeltaScale;
    } else if (event.shiftKey === true) {
      this.scrollCol += event.deltaY * this._dragDeltaYScale;
    } else {
      this.scrollRow += event.deltaY * this._dragDeltaXScale;
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

  _renderHeatmapCell(x: number, y: number, value: number): SVGTemplateResult {
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

  _renderHeatmapRow(row: Array<number>, y: number): SVGTemplateResult {
    return svg`${row.map((value, x) => this._renderHeatmapCell(x, y, value))}`;
  }

  _renderHeatmap(): SVGTemplateResult {
    return svg`
      <svg
        x="${this._heatmapXoffset}"
        y="${this._heatmapYoffset}"
        width="${this._nCols}"
        height="${this._nRows}"
        draggable="true"
        class="heatmap"
        @mousedown="${this._onHeatmapMouseDown}"
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
            translate(${-this._scrollXoffset}, ${-this._scrollYoffset})
          "
        >
          ${this.data.map((row, i) => this._renderHeatmapRow(row, i))}
        </g>
      </svg>
    `;
  }

  _renderLabels(side: Side): SVGTemplateResult {
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

      return -this._scrollXoffset;
    };

    const zoomYoffset = (s: Side): number => {
      if (s === Side.top) {
        return zoomLabelSizeoffset;
      }

      if (s === Side.bottom) {
        return 0;
      }

      return -this._scrollYoffset;
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

  _renderYscrollbar(): SVGTemplateResult {
    if (this._zoom > 1) {
      return svg`
        <rect
          x="${this._scrollbarYxoffset}"
          y="${this._scrollbarYyoffset}"
          rx="${this._scrollbarYwidth / 2}"
          width="${this._scrollbarYwidth}"
          height="${this._scrollbarYheight}"
          class="scrollbar scrollbar-y"
          @mousedown="${this._onScrollbarYMouseDown}"
        />
      `;
    }
    return svg``;
  }

  _renderXscrollbar(): SVGTemplateResult {
    if (this._zoom > 1) {
      return svg`
        <svg 
          x="${this._scrollbarXxoffset}"
          y="${this._scrollbarXyoffset}"
          ry="${this._scrollbarXheight / 2}"
          width="${this._scrollbarXwidth}"
          height="${this._scrollbarXheight}"
          class="scrollbar scrollbar-x"
          @mousedown="${this._onScrollbarXMouseDown}"
        >
          <rect
            ry="${this._scrollbarXheight / 2}"
            width="${this._scrollbarXwidth}"
            height="${this._scrollbarXheight}"
          />
        </svg>
      `;
    }
    return svg``;
  }
}
