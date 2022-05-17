/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, HTMLTemplateResult, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-labels.css.js';
import BiowcHeatmapHoverableMixin from './mixins/BiowcHeatmapHoverableMixin.js';
import BiowcHeatmapSelectableMixin from './mixins/BiowcHeatmapSelectableMixin.js';

export enum TextAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

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
          >
            ${label}
          </div>
        `
      )}
    `;
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
