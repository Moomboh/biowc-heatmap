import { LitElement, HTMLTemplateResult, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-labels.css.js';

export enum TextAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

export class BiowcHeatmapLabels extends LitElement {
  static styles = styles;

  @property({ type: String })
  textalign: TextAlign = TextAlign.left;

  @property({ type: Number })
  maxFontSize: number = 18;

  @property({ type: Boolean, reflect: true })
  horizontal: boolean = false;

  @property({ attribute: false })
  labels: string[] = [];

  @property({ attribute: false })
  hoveredIndex: number | null = null;

  private _resizeObserver: ResizeObserver | undefined;

  constructor() {
    super();
    this._resizeObserver = new ResizeObserver(this._onResize.bind(this));
    this._resizeObserver.observe(this);
  }

  updated() {
    this._setComputedStyles();
  }

  _onResize() {
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
            class="
              label
              align-${this.textalign}
              ${index === this.hoveredIndex ? 'hover' : ''}
            "
          >
            ${label}
          </div>
        `
      )}
    `;
  }
}
