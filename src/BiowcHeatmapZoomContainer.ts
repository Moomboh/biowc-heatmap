import { html, HTMLTemplateResult, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-zoom-container.css.js';
import { Side } from './BiowcHeatmap.js';
import { computed } from './util/computedDecorator.js';

export class BiowcHeatmapZoomContainer extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  side: Side = Side.left;

  @property({ attribute: false })
  zoomX = 1;

  @property({ attribute: false })
  zoomY = 1;

  render(): HTMLTemplateResult {
    return html`
      <slot></slot>
    `;
  }

  updated(changedProperties: Map<string, unknown>) {
    this.style.setProperty('overflow-y', '');
    this.style.setProperty('overflow-x', '');

    if (changedProperties.has('zoomX') && this._horizontal) {
      this.style.setProperty(
        '--biowc-heatmap-zoom-width',
        `${this.zoomX * 100}%`
      );
    }

    if (changedProperties.has('zoomY') && !this._horizontal) {
      this.style.setProperty(
        '--biowc-heatmap-zoom-height',
        `${this.zoomY * 100}%`
      );
    }

    if (changedProperties.has('zoomX') && this.zoomX > 1 && !this._horizontal) {
      this.style.setProperty('overflow-x', 'scroll');
    }

    if (changedProperties.has('zoomY') && this.zoomY > 1 && this._horizontal) {
      this.style.setProperty('overflow-y', 'scroll');
    }
  }

  @computed('side')
  private get _horizontal() {
    return this.side === Side.top || this.side === Side.bottom;
  }
}
