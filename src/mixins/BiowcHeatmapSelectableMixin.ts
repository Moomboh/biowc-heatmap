/* eslint-disable max-classes-per-file */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class BiowcHeatmapSelectableInterface {
  get selectedIndices(): Set<number>;

  set selectedIndices(value: Set<number>);

  protected _dispatchSelectEvent(typArg?: string): unknown;

  protected _selectIndices(indices: Set<number>): void;
}

export type SelectEvent = CustomEvent<{
  selectedIndices: Set<number>;
}>;

function dispatchSelectEvent(
  this: BiowcHeatmapSelectableInterface & HTMLElement,
  typeArg = 'biowc-heatmap-side-select'
) {
  const selectEvent: SelectEvent = new CustomEvent(typeArg, {
    detail: {
      selectedIndices: this.selectedIndices,
    },
  });

  this.dispatchEvent(selectEvent);
}

function selectIndices(this: any, indices: Set<number>) {
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

export default <T extends Constructor<LitElement>>(superClass: T) => {
  class BiowcHeatmapSelectable extends superClass {
    _selectedIndices: Set<number> = new Set();

    @property({ attribute: false })
    get selectedIndices(): Set<number> {
      return this._selectedIndices;
    }

    set selectedIndices(value: Set<number>) {
      this._selectedIndices = value;
    }

    protected _dispatchSelectEvent = dispatchSelectEvent;

    protected _selectIndices = selectIndices;
  }

  return BiowcHeatmapSelectable as unknown as Constructor<BiowcHeatmapSelectableInterface> &
    T;
};

export const BiowcHeatmapSelectableHTMLElementMixin = <
  T extends Constructor<HTMLElement>
>(
  superClass: T
) => {
  class BiowcHeatmapSelectableHTMLElement extends superClass {
    _selectedIndices: Set<number> = new Set();

    get selectedIndices(): Set<number> {
      return this._selectedIndices;
    }

    set selectedIndices(value: Set<number>) {
      this._selectedIndices = value;
    }

    protected _dispatchSelectEvent = dispatchSelectEvent;

    protected _selectIndices = selectIndices;
  }

  return BiowcHeatmapSelectableHTMLElement as unknown as Constructor<BiowcHeatmapSelectableInterface> &
    T;
};
