/* eslint-disable max-classes-per-file */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class BiowcHeatmapHoverableInterface {
  get hoveredIndices(): Set<number>;

  set hoveredIndices(value: Set<number>);

  protected _dispatchHoverEvent(typArg?: string): unknown;
}

export type HoverEvent = CustomEvent<{
  hoveredIndices: Set<number>;
}>;

function dispatchHoverEvent(
  this: BiowcHeatmapHoverableInterface & HTMLElement,
  typeArg = 'biowc-heatmap-side-hover'
) {
  const hoverEvent: HoverEvent = new CustomEvent(typeArg, {
    detail: {
      hoveredIndices: this.hoveredIndices,
    },
  });

  this.dispatchEvent(hoverEvent);
}

export default <T extends Constructor<LitElement>>(superClass: T) => {
  class BiowcHeatmapHoverable extends superClass {
    private _hoveredIndices: Set<number> = new Set();

    @property({ attribute: false })
    get hoveredIndices(): Set<number> {
      return this._hoveredIndices;
    }

    set hoveredIndices(value: Set<number>) {
      this._hoveredIndices = value;
    }

    protected _dispatchHoverEvent = dispatchHoverEvent;
  }

  return BiowcHeatmapHoverable as unknown as Constructor<BiowcHeatmapHoverableInterface> &
    T;
};

export const BiowcHeatmapHoverableHTMLElementMixin = <
  T extends Constructor<HTMLElement>
>(
  superClass: T
) => {
  class BiowcHeatmapHoverableHTMLElement extends superClass {
    private _hoveredIndices: Set<number> = new Set();

    get hoveredIndices(): Set<number> {
      return this._hoveredIndices;
    }

    set hoveredIndices(value: Set<number>) {
      this._hoveredIndices = value;
    }

    protected _dispatchHoverEvent = dispatchHoverEvent;
  }

  return BiowcHeatmapHoverableHTMLElement as unknown as Constructor<BiowcHeatmapHoverableInterface> &
    T;
};
