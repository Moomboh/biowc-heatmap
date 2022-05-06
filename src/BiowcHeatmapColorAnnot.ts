import { svg, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-heatmap.css.js';
import { Side } from './BiowcHeatmap.js';
import { computed } from './util/computedDecorator.js';

export class BiowcHeatmapColorAnnot extends LitElement {
  static styles = styles;

  @property({ type: String })
  side: Side = Side.top;

  @property({ attribute: false })
  colorAnnots: string[] = [];

  render(): SVGTemplateResult {
    return svg`
      <svg
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
            x="${this._horizontal ? i : 0}"
            y="${this._horizontal ? 0 : i}"
            width="1"
            height="1"
            fill="${color}"
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
}
