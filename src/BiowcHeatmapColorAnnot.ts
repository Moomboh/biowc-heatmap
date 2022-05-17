import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-color-annots.css.js';
import { Side } from './BiowcHeatmap.js';
import BiowcHeatmapHoverableMixin from './mixins/BiowcHeatmapHoverableMixin.js';
import BiowcHeatmapSelectableMixin from './mixins/BiowcHeatmapSelectableMixin.js';
import { computed } from './util/computedDecorator.js';

export type ColorLabels = { [key: string]: string };

type ColorIndices = { [key: string]: Set<number> };

export class BiowcHeatmapColorAnnot extends BiowcHeatmapSelectableMixin(
  BiowcHeatmapHoverableMixin(LitElement)
) {
  static styles = styles;

  @property({ type: String })
  side: Side = Side.top;

  @property({ attribute: false })
  colorAnnots: string[] = [];

  render(): SVGTemplateResult {
    return svg`
      <svg
        @click=${this._handleClick}
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
            @mouseleave=${this._handleMouseLeave}
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
    const color = (event.target as SVGElement)?.getAttribute('fill');

    if (!color) {
      return;
    }

    this.hoveredIndices = new Set(this._colorIndices[color]);
    this._dispatchHoverEvent();
  }

  private _handleMouseLeave() {
    this.hoveredIndices = new Set();
    this._dispatchHoverEvent();
  }

  private _handleClick() {
    this._selectIndices(this.hoveredIndices);
  }
}
