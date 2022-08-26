/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, HTMLTemplateResult, html, render, svg } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-labels.css.js';
import {
  DEFAULT_SVG_CELL_HEIGHT,
  DEFAULT_SVG_CELL_WIDTH,
  DEFAULT_SVG_FONT_SIZE,
  DEFAULT_SVG_LABELS_HEIGHT,
} from './BiowcHeatmap.js';
import BiowcHeatmapHoverableMixin from './mixins/BiowcHeatmapHoverableMixin.js';
import BiowcHeatmapSelectableMixin from './mixins/BiowcHeatmapSelectableMixin.js';

export enum TextAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

let nextClipPathId = 0;

export class BiowcHeatmapLabels extends BiowcHeatmapSelectableMixin(
  BiowcHeatmapHoverableMixin(LitElement)
) {
  static styles = styles;

  @property({ type: String })
  textalign: TextAlign = TextAlign.left;

  @property({ type: Number })
  maxFontSize: number = 18;

  @property({ type: Boolean, reflect: true })
  horizontal: boolean = false;

  @property({ attribute: false })
  labels: string[] = [];

  private _resizeObserver: ResizeObserver | undefined;

  constructor() {
    super();
    this._resizeObserver = new ResizeObserver(this._handleResize.bind(this));
    this._resizeObserver.observe(this);
  }

  updated() {
    this._setComputedStyles();
  }

  _handleResize() {
    this._setComputedStyles();
  }

  private _setComputedStyles() {
    const height = this.horizontal ? this.clientWidth : this.clientHeight;
    const fontSize = Math.min(height / this.labels.length, this.maxFontSize);
    this.style.setProperty('--biowc-heatmap-labels-font-size', `${fontSize}px`);
  }

  render(): HTMLTemplateResult {
    if (this.labels.length === 0) {
      return html``;
    }

    return html`
      ${this.labels.map(
        (label, index) => html`
          <div
            @mouseenter=${this._handleMouseEnter(index)}
            @mouseleave=${this._handleMouseLeave}
            @click=${this._handleClick}
            class="
              label
              align-${this.textalign}
              ${this.hoveredIndices.has(index) ? 'hover' : ''}
              ${this.selectedIndices.has(index) ? 'selected' : ''}
            "
            title="${label}"
          >
            ${label}
          </div>
        `
      )}
    `;
  }

  exportSVG(
    height = DEFAULT_SVG_LABELS_HEIGHT,
    cellWidth = DEFAULT_SVG_CELL_WIDTH,
    cellHeight = DEFAULT_SVG_CELL_HEIGHT,
    maxFontSize = DEFAULT_SVG_FONT_SIZE
  ) {
    const tempContainerEl = document.createElement('div');

    const { length } = this.labels;

    // if (this.horizontal)
    let svgWidth = length * cellWidth;
    let svgHeight = height;
    if (!this.horizontal) {
      svgHeight = length * cellHeight;
      svgWidth = height;
    }

    let fontSize = maxFontSize;
    if (this.horizontal) {
      fontSize = Math.min(cellWidth, maxFontSize);
    } else {
      fontSize = Math.min(cellHeight, maxFontSize);
    }

    const isAlignLeft = this.textalign === TextAlign.left;
    const textAnchor = isAlignLeft ? 'start' : 'end';

    // if (!this.horizontal && isAlignLeft)
    let preserveAspectRatio = 'xMinYMid meet';
    if (!this.horizontal && !isAlignLeft) {
      preserveAspectRatio = 'xMaxYMid meet';
    } else if (this.horizontal && !isAlignLeft) {
      preserveAspectRatio = 'xMidYMax meet';
    } else if (this.horizontal && isAlignLeft) {
      preserveAspectRatio = 'xMidYMin meet';
    }

    const step = this.horizontal ? cellWidth : cellHeight;

    render(
      svg`
      <svg
        preserveAspectRatio="${preserveAspectRatio}"
        width="${svgWidth}"
        height="${svgHeight}"
      >
        <clipPath id="clip-${nextClipPathId}">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
          />
        </clipPath>

        <g clip-path="url(#clip-${nextClipPathId})">
          <g
            transform="${
              this.horizontal
                ? `translate(0, ${
                    isAlignLeft ? svgHeight : svgWidth
                  }) rotate(-90)`
                : ''
            }"
          >
            ${this.labels.map((label, index) => {
              const offset = (index + 0.5) * step;

              return svg`
                  <text
                    class="label-text"
                    x="${isAlignLeft ? 0.25 * step : svgWidth - 0.25 * step}"
                    y="${offset}"
                    text-anchor="${textAnchor}"
                    dominant-baseline="middle"
                    font-size="${fontSize}"
                    font-family="sans-serif"
                  >
                    ${label}
                  </text>
                `;
            })}
          </g>
        </g>
      </svg>
      `,
      tempContainerEl
    );

    // TODO: this is a workaround for avoiding duplicate ids
    nextClipPathId += 1;

    return tempContainerEl.querySelector('svg') as SVGSVGElement;
  }

  private _handleMouseEnter(index: number) {
    return () => {
      this.hoveredIndices = new Set([index]);
      this._dispatchHoverEvent();
    };
  }

  private _handleMouseLeave() {
    this.hoveredIndices = new Set();
    this._dispatchHoverEvent();
  }

  private _handleClick() {
    this._selectIndices(this.hoveredIndices);
  }
}
