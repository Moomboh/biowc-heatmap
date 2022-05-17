/* eslint-disable max-classes-per-file */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class BiowcHeatmapSelectableInterface {
  selectedIndices: Set<number>;

  protected _dispatchSelectEvent(typArg?: string): unknown;

  protected _selectIndices(indices: Set<number>): void;
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

    protected _selectIndices(indices: Set<number>) {
      const toSelect = [...indices];
      const selected: Set<number> = new Set([...this.selectedIndices]);

      if (toSelect.every(x => selected.has(x))) {
        toSelect.forEach(x => {
          selected.delete(x);
        });
      } else {
        toSelect.forEach(x => {
          selected.add(x);
        });
      }

      this.selectedIndices = selected;

      this._dispatchSelectEvent();
    }
  }

  return BiowcHeatmapSelectable as unknown as Constructor<BiowcHeatmapSelectableInterface> &
    T;
};
