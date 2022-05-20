import {
  html,
  LitElement,
  HTMLTemplateResult,
  svg,
  SVGTemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-legend.css.js';
import {
  AxisLabels,
  BiowcHeatmap,
  ColorAnnotLabels,
  SIDES,
} from './BiowcHeatmap.js';
import { defaultCellColorScale } from './BiowcHeatmapHeatmap.js';
import { ColorScaleConfig } from './util/colors.js';
import { computed } from './util/computedDecorator.js';

export class BiowcHeatmapLegend extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  forHeatmap: BiowcHeatmap | null = null;

  // eslint-disable-next-line class-methods-use-this
  @property({ attribute: false })
  formatColorTick: (value: number) => string = value =>
    `${Math.round(value * 100) / 100}`;

  render(): HTMLTemplateResult {
    if (!this.forHeatmap) {
      return html``;
    }

    return html`
      <div class="color-scale">
        ${this._renderColorScaleGradient()}
        ${this._renderColorScaleTicks()}
        ${this._renderColorScaleLabels()}
      </div>
      <div class="color-annot">
        ${this._renderColorAnnotLabels()}
      </div>
    `;
  }

  private _renderColorScaleGradient() {
    return svg`
      <svg
        class="color-scale-gradient"
        preserveAspectRatio="none"
        viewBox="
          0 0
          1 ${this._scaleDeltaMinMax}
        ">
        ${this._colorScale.colors.map((color, i) =>
          this._renderColorScaleSegment(color, i)
        )}
      </svg>
    `;
  }

  private _renderColorScaleSegment(
    color: string,
    i: number
  ): SVGTemplateResult {
    if (i === this._colorScale.values.length - 1) {
      return svg``;
    }

    const fromVal = this._colorScale.values[i] - this._colorScaleMinValue;
    const toVal = this._colorScale.values[i + 1] - this._colorScaleMinValue;
    const fromCol = color;
    const toCol = this._colorScale.colors[i + 1];

    return svg`
      <linearGradient id="gradient-${i}" gradientTransform="rotate(90)">
        <stop stop-color="${fromCol}" offset="0%"/>
        <stop stop-color="${toCol}" offset="100%"/>
      </linearGradient>
      <rect
        x="0"
        y="${fromVal}"
        width="1"
        height="${toVal - fromVal}"
        fill="url(#gradient-${i})"
      />
    `;
  }

  private _renderColorScaleTicks() {
    return svg`
      <svg
        class="color-scale-ticks"
        preserveAspectRatio="none"	
        viewBox="
          0 0
          1 ${this._scaleDeltaMinMax}
        ">
        ${this._colorScale.values.map(value => {
          const y = value - this._colorScaleMinValue;
          return svg`
              <line
                class="color-scale-ticks-line"
                x1="0"
                y1="${y}"
                x2="1"
                y2="${y}"	
              />
            `;
        })}
      </svg>
    `;
  }

  private _renderColorScaleLabels() {
    return html`
      ${this._colorScale.values.map(value => {
        const y = value - this._colorScaleMinValue;
        const top =
          (y / (this._colorScaleMaxValue - this._colorScaleMinValue)) * 100;
        return html`
          <div
            class="color-scale-label"
            style="
              top: ${top}%;
            "
          >
            ${this.formatColorTick(value)}
          </div>
        `;
      })}
    `;
  }

  private _renderColorAnnotLabels() {
    return html`
      ${SIDES.map(side => {
        const colorAnnotLabels = this._colorAnnotLabels[side];
        const axisLabel = this._axisLabels[side];

        if (!colorAnnotLabels) {
          return html``;
        }

        return html`
          <div class="axis-label">
            ${axisLabel ?? ''}
          </div>
          ${Object.entries(colorAnnotLabels).map(
            ([color, label]) =>
              html`
              <div class="color-annot-label">
                <span
                  class="color-annot-label-color"
                  style="
                    background-color: ${color};
                  "
                ></span>
                ${label}
              </div>
            `
          )}
        `;
      })}
    `;
  }

  @computed('forHeatmap')
  private get _colorScale(): ColorScaleConfig {
    return this.forHeatmap?.cellColorScale ?? defaultCellColorScale;
  }

  @computed('_colorScale')
  private get _colorScaleMaxValue(): number {
    const { values } = this._colorScale;
    return values[values.length - 1];
  }

  @computed('_colorScale')
  private get _colorScaleMinValue(): number {
    const { values } = this._colorScale;
    return values[0];
  }

  @computed('_colorScaleMaxValue', '_colorScaleMinValue')
  private get _scaleDeltaMinMax() {
    return this._colorScaleMaxValue - this._colorScaleMinValue;
  }

  @computed('forHeatmap')
  private get _axisLabels(): AxisLabels {
    return this.forHeatmap?.axisLabels ?? {};
  }

  @computed('forHeatmap')
  private get _colorAnnotLabels(): ColorAnnotLabels {
    return this.forHeatmap?.colorAnnotLabels ?? {};
  }
}
