import { html, HTMLTemplateResult, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-zoom-container.css.js';
import { Side } from './BiowcHeatmap.js';
import { computed } from './util/computedDecorator.js';

export class BiowcHeatmapZoomContainer extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  side: Side = Side.left;

  get zoomX() {
    return this._zoomX;
  }

  set zoomX(value: number) {
    this._zoomX = value;
    this._updateStyle();
  }

  get zoomY() {
    return this._zoomY;
  }

  set zoomY(value: number) {
    this._zoomY = value;
    this._updateStyle();
  }

  private _zoomX = 1;

  private _zoomY = 1;

  render(): HTMLTemplateResult {
    return html`
      <slot></slot>
    `;
  }

  private _updateStyle() {
    this.style.setProperty('overflow-y', '');
    this.style.setProperty('overflow-x', '');

    if (this.zoomX > 1 && !this._horizontal) {
      this.style.setProperty('overflow-x', 'scroll');
    }

    if (this.zoomY > 1 && this._horizontal) {
      this.style.setProperty('overflow-y', 'scroll');
    }
  }

  @computed('side')
  private get _horizontal() {
    return this.side === Side.top || this.side === Side.bottom;
  }
}
