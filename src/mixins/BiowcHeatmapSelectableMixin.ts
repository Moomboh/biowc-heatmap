/* eslint-disable max-classes-per-file */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class BiowcHeatmapSelectableInterface {
  selectedIndices: Set<number>;

  protected _dispatchSelectEvent(typArg?: string): unknown;
}

export type SelectEvent = CustomEvent<{
  selectedIndices: Set<number>;
}>;

export default <T extends Constructor<LitElement>>(superClass: T) => {
  class BiowcHeatmapSelectable extends superClass {
    @property({ attribute: false })
    selectedIndices: Set<number> = new Set();

    protected _dispatchSelectEvent(typeArg = 'biowc-heatmap-side-select') {
      const selectEvent: SelectEvent = new CustomEvent(typeArg, {
        detail: {
          selectedIndices: this.selectedIndices,
        },
      });

      this.dispatchEvent(selectEvent);
    }
  }

  return BiowcHeatmapSelectable as unknown as Constructor<BiowcHeatmapSelectableInterface> &
    T;
};
