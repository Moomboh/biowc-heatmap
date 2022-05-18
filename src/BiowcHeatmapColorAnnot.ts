import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-color-annots.css.js';
import { Side } from './BiowcHeatmap.js';
import BiowcHeatmapHoverableMixin from './mixins/BiowcHeatmapHoverableMixin.js';
import BiowcHeatmapSelectableMixin from './mixins/BiowcHeatmapSelectableMixin.js';
import { computed } from './util/computedDecorator.js';

export type ColorLabels = { [key: string]: string };

export type ColorHoverEvent = CustomEvent<{
  color: string | null;
  side: Side;
}>;

type ColorIndices = { [key: string]: Set<number> };

export class BiowcHeatmapColorAnnot extends BiowcHeatmapSelectableMixin(
  BiowcHeatmapHoverableMixin(LitElement)
) {
  static styles = styles;

  @property({ type: String })
  side: Side = Side.top;

  @property({ attribute: false })
  colorAnnots: string[] = [];

  hoveredColor: string | null = null;

  render(): SVGTemplateResult {
    return svg`
      <svg
        @click=${this._handleClick}
        @mouseleave=${this._handleMouseLeave}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="
          0
          0
          ${this._horizontal ? this._annotLength : 1}
          ${this._horizontal ? 1 : this._annotLength}
        "
      >
        ${this.colorAnnots.map(
          (color, i) => svg`
          <rect
            @mouseenter=${this._handleMouseEnter}
            x="${this._horizontal ? i : 0}"
            y="${this._horizontal ? 0 : i}"
            width="1"
            height="1"
            fill="${color}"
            class="
              ${this.hoveredIndices.has(i) ? 'hovered' : ''}
              ${this.selectedIndices.has(i) ? 'selected' : ''}
            "
          />
        `
        )}
      </svg>
    `;
  }

  @computed('annotColors')
  private get _annotLength(): number {
    return this.colorAnnots.length;
  }

  @computed('side')
  private get _horizontal(): boolean {
    return this.side === Side.top || this.side === Side.bottom;
  }

  @computed('colorAnnots')
  private get _colorIndices(): ColorIndices {
    const colorIndices: ColorIndices = {};

    for (const [i, color] of this.colorAnnots.entries()) {
      if (!Object.prototype.hasOwnProperty.call(colorIndices, color)) {
        colorIndices[color] = new Set([i]);
      } else {
        colorIndices[color].add(i);
      }
    }

    return colorIndices;
  }

  private _handleMouseEnter(event: MouseEvent) {
    const rectElement = event.target as SVGElement | null;
    const i = parseInt(
      (this._horizontal
        ? rectElement?.getAttribute('x')
        : rectElement?.getAttribute('y')) ?? '-1',
      10
    );

    if (i === -1) {
      return;
    }

    const color = this.colorAnnots[i];

    if (color === this.hoveredColor) {
      return;
    }

    this.hoveredColor = color;
    this.hoveredIndices = new Set(this._colorIndices[color]);
    this._dispatchHoverEvent();
    this._dispatchHoverColorEvent();
  }

  private _handleMouseLeave() {
    this.hoveredColor = null;
    this.hoveredIndices = new Set();
    this._dispatchHoverEvent();
    this._dispatchHoverColorEvent();
  }

  private _handleClick() {
    this._selectIndices(this.hoveredIndices);
  }

  private _dispatchHoverColorEvent() {
    const hoverColorEvent: ColorHoverEvent = new CustomEvent(
      'biowc-heatmap-annot-color-hover',
      {
        detail: {
          side: this.side,
          color: this.hoveredColor,
        },
      }
    );

    this.dispatchEvent(hoverColorEvent);
  }
}
