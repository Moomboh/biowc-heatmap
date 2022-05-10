/* eslint-disable max-classes-per-file */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class BiowcHeatmapHoverableInterface {
  hoveredIndices: Set<number>;

  protected _dispatchHoverEvent(typArg?: string): unknown;
}

export type HoverEvent = CustomEvent<{
  hoveredIndices: Set<number>;
}>;

export default <T extends Constructor<LitElement>>(superClass: T) => {
  class BiowcHeatmapHoverable extends superClass {
    @property({ attribute: false })
    hoveredIndices: Set<number> = new Set();

    protected _dispatchHoverEvent(typeArg = 'biowc-heatmap-side-hover') {
      const hoverEvent: HoverEvent = new CustomEvent(typeArg, {
        detail: {
          hoveredIndices: this.hoveredIndices,
        },
      });

      this.dispatchEvent(hoverEvent);
    }
  }

  return BiowcHeatmapHoverable as unknown as Constructor<BiowcHeatmapHoverableInterface> &
    T;
};
