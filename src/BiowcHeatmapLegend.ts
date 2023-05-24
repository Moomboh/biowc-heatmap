import {
  html,
  LitElement,
  HTMLTemplateResult,
  svg,
  SVGTemplateResult,
  render,
} from 'lit';
import { property } from 'lit/decorators.js';
import styles, { svgCss } from './biowc-heatmap-legend.css.js';
import {
  AxisLabels,
  BiowcHeatmap,
  ColorAnnotLabels,
  DEFAULT_SVG_FONT_SIZE,
  DEFAULT_SVG_LEGEND_COLOR_SCALE_GRADIENT_WIDTH,
  DEFAULT_SVG_LEGEND_COLOR_SCALE_HEIGHT,
  DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_LABEL_MARGIN,
  DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_WIDTH,
  DEFAULT_SVG_LEGEND_HEIGHT,
  DEFAULT_SVG_LEGEND_WIDTH,
  SIDES,
} from './BiowcHeatmap.js';
import { defaultCellColorScale } from './BiowcHeatmapHeatmap.js';
import { ColorScaleConfig } from './util/colors.js';
import { computed } from './util/computedDecorator.js';

let nextGradientId = 0;

export class BiowcHeatmapLegend extends LitElement {
  static styles = styles;

  @property({ type: String, attribute: 'color-scale-title' })
  colorScaleTitle: string = '';

  @property({ attribute: false })
  forHeatmap: BiowcHeatmap | null = null;

  // eslint-disable-next-line class-methods-use-this
  @property({ attribute: false })
  formatColorTick: (value: number) => string = value =>
    (Math.round(value * 100) / 100).toFixed(2);

  render(): HTMLTemplateResult {
    if (!this.forHeatmap) {
      return html``;
    }

    return html`
      <div class="color-annot" part="color-annot">
        ${this._renderColorAnnotLabels()}
      </div>
      <div class="color-scale-title" part="color-scale-title">
        ${this.colorScaleTitle}
      </div>
      <div class="color-scale" part="color-scale">
        ${this._renderColorScaleGradient()}
        ${this._renderColorScaleTicks()}
        ${this._renderColorScaleLabels()}
      </div>
    `;
  }

  exportSVG(
    width = DEFAULT_SVG_LEGEND_WIDTH,
    height = DEFAULT_SVG_LEGEND_HEIGHT,
    colorScaleHeight = DEFAULT_SVG_LEGEND_COLOR_SCALE_HEIGHT,
    gradientWidth = DEFAULT_SVG_LEGEND_COLOR_SCALE_GRADIENT_WIDTH,
    fontSize = DEFAULT_SVG_FONT_SIZE,
    colorScaleTitleFontSize = 1.1 * fontSize,
    colorScaleTitleMarginTop = 0.5 * fontSize,
    colorScaleTitleMarginBottom = 0.25 * fontSize
  ) {
    const tempContainerEl = document.createElement('div');

    const colorAnnotLabelsSVG = this.getColorAnnotLabelsSVG(width);
    const colorAnnotHeight = parseInt(
      colorAnnotLabelsSVG.getAttribute('height') ?? '0',
      10
    );
    const colorScaleSVG = this.getColorScaleSVG(
      width,
      colorScaleHeight,
      gradientWidth
    );

    const colorScaleTitleText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    colorScaleTitleText.textContent = this.colorScaleTitle;
    colorScaleTitleText.style.font = `${colorScaleTitleFontSize}px sans-serif`;
    colorScaleTitleText.setAttribute('x', '0');
    colorScaleTitleText.setAttribute(
      'y',
      `${colorAnnotHeight + colorScaleTitleMarginTop}`
    );

    colorScaleSVG.setAttribute('x', '0');
    colorScaleSVG.setAttribute(
      'y',
      `${
        colorAnnotHeight +
        colorScaleTitleMarginTop +
        colorScaleTitleFontSize +
        colorScaleTitleMarginBottom
      }`
    );

    render(
      svg`
      <svg
        width="${width}"
        height="${height}"
      >
        <style>${svgCss(fontSize)}</style>
      </svg>
      `,
      tempContainerEl
    );

    const svgEl = tempContainerEl.firstElementChild as SVGSVGElement;
    svgEl.appendChild(colorAnnotLabelsSVG);
    svgEl.appendChild(colorScaleTitleText);
    svgEl.appendChild(colorScaleSVG);

    return svgEl;
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
          <rect
            class="color-scale-gradient-border"
            x="0"
            y="0"
            width="100%"
            height="100%"
          />
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

    // TODO: this is a workaround for avoiding duplicate ids
    nextGradientId += 1;

    return svg`
      <linearGradient
        id="color-scale-gradient-${nextGradientId}"
        gradientTransform="rotate(90)"
      >
        <stop stop-color="${fromCol}" offset="0%"/>
        <stop stop-color="${toCol}" offset="100%"/>
      </linearGradient>
      <rect
        x="0"
        y="${fromVal}"
        width="1"
        height="${toVal - fromVal}"
        fill="url(#color-scale-gradient-${nextGradientId})"
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

  getColorAnnotLabelsSVG(
    width = DEFAULT_SVG_LEGEND_WIDTH,
    fontSize = DEFAULT_SVG_FONT_SIZE
  ) {
    const containerElement = document.createElement('div');

    const axisLabelFontSize = fontSize * 1.1;
    const axisLabelMarginTop = 0.5 * fontSize;
    const axisLabelMarginBottom = 0.25 * fontSize;

    const sideLabelHeights = SIDES.map(side => {
      const colorAnnotLabels = this._colorAnnotLabels[side] ?? {};
      const length = Object.keys(colorAnnotLabels).length ?? 0;
      return length * fontSize + Math.min(length, 1) * 2 * fontSize;
    });

    const sideLabelOffsets = sideLabelHeights.map(
      (sum => value => {
        // eslint-disable-next-line no-param-reassign
        sum += value;
        return sum;
      })(0)
    );

    const height =
      sideLabelOffsets[sideLabelOffsets.length - 1] +
      axisLabelFontSize +
      sideLabelHeights.reduce(
        (sum, value) =>
          sum +
          Math.min(value, 1) * (axisLabelMarginBottom + axisLabelMarginTop),
        0
      );

    render(
      svg`
      <svg width="${width}" height="${height}">
        ${SIDES.map((side, sideIndex) => {
          const colorAnnotLabels = this._colorAnnotLabels[side];
          const axisLabel = this._axisLabels[side];

          if (!colorAnnotLabels) {
            return svg``;
          }

          const sideOffset =
            (sideIndex ? sideLabelOffsets[sideIndex - 1] : 0) +
            axisLabelFontSize +
            axisLabelMarginTop * sideIndex;

          return svg`
            <text
              class="axis-label"
              x="0"
              y="${sideOffset}"
            >
              ${axisLabel ?? ''}
            </text>
            ${Object.entries(colorAnnotLabels).map(
              ([color, label], index) => svg`
                <rect
                  x="0"
                  y="${
                    sideOffset +
                    axisLabelMarginBottom +
                    index * fontSize +
                    0.25 * fontSize
                  }"
                  fill="${color}"
                  width="${fontSize * 0.75}"
                  height="${fontSize * 0.75}"
                />
                <text
                  class="color-annot-label"
                  x="${fontSize}"
                  y="${
                    sideOffset + axisLabelMarginBottom + (index + 1) * fontSize
                  }"
                >
                  ${label}
                </text>
              `
            )}
          `;
        })}
      </svg>
    `,
      containerElement
    );

    return containerElement.firstElementChild as SVGSVGElement;
  }

  getColorScaleSVG(
    width = DEFAULT_SVG_LEGEND_WIDTH,
    height = DEFAULT_SVG_LEGEND_COLOR_SCALE_HEIGHT,
    gradientWidth = DEFAULT_SVG_LEGEND_COLOR_SCALE_GRADIENT_WIDTH,
    ticksWidth = DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_WIDTH,
    tickLabelLeftMargin = DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_LABEL_MARGIN
  ) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', `${width}`);
    svgEl.setAttribute('height', `${height}`);

    const colorScaleGradientSVG = this.getColorScaleGradientSVG();
    colorScaleGradientSVG.setAttribute('width', `${gradientWidth}`);
    colorScaleGradientSVG.setAttribute('height', `${height}`);

    const colorScaleTicksSVG = this.getColorScaleTicksSVG();
    colorScaleTicksSVG.setAttribute('y', '0');
    colorScaleTicksSVG.setAttribute('x', `${gradientWidth - ticksWidth / 2}`);
    colorScaleTicksSVG.setAttribute('width', `${ticksWidth}`);
    colorScaleTicksSVG.setAttribute('height', `${height}`);

    const colorScaleLabelsSVG = this.getColorScaleLabelsSVG();
    colorScaleLabelsSVG.setAttribute('y', '0');
    colorScaleLabelsSVG.setAttribute(
      'x',
      `${gradientWidth + ticksWidth / 2 + tickLabelLeftMargin}`
    );
    colorScaleLabelsSVG.setAttribute(
      'width',
      `${width - gradientWidth - ticksWidth}`
    );
    colorScaleLabelsSVG.setAttribute('height', `${height}`);

    svgEl.appendChild(colorScaleGradientSVG);
    svgEl.appendChild(colorScaleTicksSVG);
    svgEl.appendChild(colorScaleLabelsSVG);

    return svgEl as unknown as SVGSVGElement;
  }

  getColorScaleGradientSVG() {
    const containerTempEl = document.createElement('div');
    render(this._renderColorScaleGradient(), containerTempEl);
    return containerTempEl.firstElementChild as SVGSVGElement;
  }

  getColorScaleTicksSVG() {
    const containerTempEl = document.createElement('div');
    render(this._renderColorScaleTicks(), containerTempEl);
    return containerTempEl.firstElementChild as SVGSVGElement;
  }

  getColorScaleLabelsSVG(
    width = DEFAULT_SVG_LEGEND_WIDTH -
      DEFAULT_SVG_LEGEND_COLOR_SCALE_GRADIENT_WIDTH -
      DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_LABEL_MARGIN -
      DEFAULT_SVG_LEGEND_COLOR_SCALE_TICKS_WIDTH / 2,
    height = DEFAULT_SVG_LEGEND_COLOR_SCALE_HEIGHT
  ) {
    const containerTempEl = document.createElement('div');
    render(
      svg`
      <svg width="${width}" height="${height}">
        ${this._colorScale.values.map(value => {
          const relativeVal =
            (value - this._colorScaleMinValue) /
            (this._colorScaleMaxValue - this._colorScaleMinValue);

          let y = relativeVal * height;

          let dominantBaseline = 'middle';
          if (relativeVal === 0) {
            dominantBaseline = 'hanging';
            y += 1; // small offset because text gets clipped otherwise
          } else if (relativeVal === 1) {
            y -= 3; // small offset because text gets clipped otherwise
            dominantBaseline = 'auto';
          }

          return svg`
            <text
              class="color-scale-label"
              x="0"
              y="${y}"
              dominant-baseline="${dominantBaseline}"
            >
              ${this.formatColorTick(value)}
            </text>
          `;
        })}
      `,
      containerTempEl
    );

    return containerTempEl.firstElementChild as SVGSVGElement;
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
