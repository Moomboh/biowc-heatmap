import { LitElement, PropertyValueMap, svg, SVGTemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './biowc-heatmap-dendrogram.css.js';
import { Side } from './BiowcHeatmap.js';
import range from './util/range.js';

export interface DendrogramNode {
  left: DendrogramNode | number;
  right: DendrogramNode | number;
  height: number;
}

export function isDendrogramNode(object: any) {
  return (
    typeof object === 'object' &&
    (typeof object.left === 'number' || typeof object.left === 'object') &&
    (typeof object.right === 'number' || typeof object.right === 'object') &&
    typeof object.height === 'number'
  );
}

export interface DendrogramEntry {
  left: number;
  isLeftDendrogram: boolean;
  right: number;
  isRightDendrogram: boolean;
  height: number;
  center?: number;
  leftBoundary?: number;
  rightBoundary?: number;
}

export type DendrogramList = DendrogramEntry[];

type Point = { x: number; y: number };
interface DendrogramPath {
  bottomLeft: Point;
  bottomRight: Point;
  topLeft: Point;
  topRight: Point;
  leftBoundary: number;
  rightBoundary: number;
  selected: boolean;
  hovered: boolean;
  height: number;
}

function dendrogramTreeToList(tree: DendrogramNode): DendrogramList {
  const list: DendrogramList = [];

  const recurse = (node: DendrogramNode): number => {
    const isLeftDendrogram = isDendrogramNode(node.left);
    const isRightDendrogram = isDendrogramNode(node.right);

    const left = isLeftDendrogram
      ? recurse(node.left as DendrogramNode)
      : (node.left as number);
    const right = isRightDendrogram
      ? recurse(node.right as DendrogramNode)
      : (node.right as number);

    const { height } = node;

    return (
      list.push({
        left,
        isLeftDendrogram,
        right,
        isRightDendrogram,
        height,
      }) - 1
    );
  };

  recurse(tree);
  return list;
}

function calcDendrogragramListMaxHeight(list: DendrogramList): number {
  let maxHeight = 0;

  for (const entry of list) {
    if (entry.height > maxHeight) {
      maxHeight = entry.height;
    }
  }

  return maxHeight;
}

function calcDendrogramListWidth(list: DendrogramList): number {
  let minLeft = Infinity;
  let maxRight = -Infinity;

  for (const entry of list) {
    if (entry.left < minLeft) {
      minLeft = entry.left;
    }

    if (entry.right > maxRight) {
      maxRight = entry.right;
    }
  }

  return maxRight - minLeft;
}

function calcDendrogramListCentersAndBoundaries(
  list: DendrogramList
): DendrogramList {
  // TODO: Maybe there is a more readable and/or efficent way to do this (without
  // recursion since then we would be again limited by the maximum call stack size)?
  const resultList: DendrogramList = Array(list.length);
  const toProcess: Array<number> = [...list.keys()];
  const stack: number[] = [];

  while (toProcess.length + stack.length > 0) {
    const index = stack.pop() || toProcess[toProcess.length - 1];
    toProcess.splice(index);
    const entry = list[index];
    const { left, right, isLeftDendrogram, isRightDendrogram } = entry;

    const leftCenter = resultList[left]?.center;
    const rightCenter = resultList[right]?.center;
    const leftLowerBoundary = resultList[left]?.leftBoundary;
    const leftUpperBoundary = resultList[left]?.rightBoundary;
    const rightLowerBoundary = resultList[right]?.leftBoundary;
    const rightUpperBoundary = resultList[right]?.rightBoundary;

    const isLeftValueMissing =
      leftCenter === undefined ||
      leftLowerBoundary === undefined ||
      leftUpperBoundary === undefined;
    const isRightValueMissing =
      rightCenter === undefined ||
      rightLowerBoundary === undefined ||
      rightUpperBoundary === undefined;

    if (isLeftDendrogram && isLeftValueMissing) {
      stack.push(index);
      stack.push(left);
    } else if (isRightDendrogram && isRightValueMissing) {
      stack.push(index);
      stack.push(right);
    } else if (!isLeftDendrogram && !isRightDendrogram) {
      resultList[index] = {
        ...entry,
        center: (left + right) / 2,
        leftBoundary: left,
        rightBoundary: right,
      };
    } else if (isLeftDendrogram && !isRightDendrogram && !isLeftValueMissing) {
      resultList[index] = {
        ...entry,
        center: (leftCenter + right) / 2,
        leftBoundary: leftLowerBoundary,
        rightBoundary: right,
      };
    } else if (!isLeftDendrogram && isRightDendrogram && !isRightValueMissing) {
      resultList[index] = {
        ...entry,
        center: (left + rightCenter) / 2,
        leftBoundary: left,
        rightBoundary: rightUpperBoundary,
      };
    } else if (
      isLeftDendrogram &&
      isRightDendrogram &&
      !isLeftValueMissing &&
      !isRightValueMissing
    ) {
      resultList[index] = {
        ...entry,
        center: (leftCenter + rightCenter) / 2,
        leftBoundary: leftLowerBoundary,
        rightBoundary: rightUpperBoundary,
      };
    } else {
      throw new Error('Invalid dendrogram list');
    }
  }

  return resultList;
}

export class BiowcHeatmapDendrogram extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  side: Side = Side.top;

  @property({ attribute: false })
  dendrogram: DendrogramNode | DendrogramList = [];

  @property({ type: Number })
  xShift = 0.5;

  @property({ type: Number })
  yShift = 0.0;

  @property({ type: Number })
  selectionMarkerWidth = 0.8;

  @property({ attribute: false })
  selected: Set<number> = new Set();

  @state()
  private _hoverLeftBoundary = 0;

  @state()
  private _hoverRightBoundary = 0;

  render(): SVGTemplateResult {
    if (this._dendrogramList.length === 0) {
      return svg``;
    }

    return svg`
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 ${this._viewboxWidth} ${this._viewboxHeight}"
        preserveAspectRatio="none"
      >
        ${this._dendrogramPaths.map(path => this._renderPath(path))}
        ${[...this.selected].map(index => this._renderSelected(index))}]}
      </svg>
    `;
  }

  willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log('willUpdate');
    super.willUpdate(_changedProperties);
  }

  private _renderPath(path: DendrogramPath): SVGTemplateResult {
    const pointList = [
      path.bottomLeft,
      path.topLeft,
      path.topRight,
      path.bottomRight,
    ];

    const [bottomLeft, topLeft, topRight, bottomRight] = pointList.map(
      this._transformCoords
    );

    return svg`
        <path
          class="
            ${path.hovered ? 'hovered' : ''}
            ${path.selected ? 'selected' : ''}
          "
          d="
            M${bottomLeft.x} ${bottomLeft.y}
            L${topLeft.x} ${topLeft.y}
            L${topRight.x} ${topRight.y}
            L${bottomRight.x} ${bottomRight.y}
          "
          @mouseenter="${this._onPathMouseenter(
            path.leftBoundary,
            path.rightBoundary
          )}"
          @mouseleave="${this._onPathMouseleave}"
          @click="${this._onPathClick}"
        />
      `;
  }

  private _renderSelected(index: number): SVGTemplateResult {
    const from = this._transformCoords({
      x: index - this.selectionMarkerWidth / 2,
      y: -this.yShift,
    });

    const to = this._transformCoords({
      x: index + this.selectionMarkerWidth / 2,
      y: -this.yShift,
    });

    return svg`
      <line
        class="selection-marker"
        x1="${from.x}"
        y1="${from.y}"
        x2="${to.x}"
        y2="${to.y}"
      />
    `;
  }

  private _onPathMouseenter(leftBoundary: number, rightBoundary: number) {
    return () => {
      this._hoverLeftBoundary = leftBoundary;
      this._hoverRightBoundary = rightBoundary;

      const pathHoverEvent = new CustomEvent('biowc-heatmap-dendrogram-hover', {
        detail: {
          leftBoundary,
          rightBoundary,
        },
      });

      this.dispatchEvent(pathHoverEvent);
    };
  }

  private _onPathMouseleave() {
    this._hoverLeftBoundary = 0;
    this._hoverRightBoundary = 0;

    const hoverEvent = new CustomEvent('biowc-heatmap-dendrogram-hover', {
      detail: {
        leftBoundary: 0,
        rightBoundary: 0,
      },
    });
    this.dispatchEvent(hoverEvent);
  }

  private _onPathClick() {
    const hovered = range(this._hoverLeftBoundary, this._hoverRightBoundary);

    if (hovered.every(x => this.selected.has(x))) {
      hovered.forEach(x => this.selected.delete(x));
    } else {
      hovered.forEach(x => {
        this.selected.add(x);
      });
    }

    const selectedEvent = new CustomEvent('biowc-heatmap-dendrogram-select', {
      detail: {
        selected: this.selected,
      },
    });
    this.dispatchEvent(selectedEvent);

    this.requestUpdate('selected');
  }

  private get _horizontal(): boolean {
    return this.side === Side.top || this.side === Side.bottom;
  }

  private get _dendrogramList(): DendrogramList {
    if (isDendrogramNode(this.dendrogram)) {
      return calcDendrogramListCentersAndBoundaries(
        dendrogramTreeToList(this.dendrogram as DendrogramNode)
      );
    }

    return calcDendrogramListCentersAndBoundaries(
      this.dendrogram as DendrogramList
    );
  }

  private get _dendrogramHeight(): number {
    return calcDendrogragramListMaxHeight(this._dendrogramList);
  }

  private get _dendrogramWidth(): number {
    return calcDendrogramListWidth(this._dendrogramList);
  }

  private get _dendrogramPaths(): DendrogramPath[] {
    const list = this._dendrogramList;
    const paths: DendrogramPath[] = [];

    for (const entry of list) {
      const { left, right, height, isLeftDendrogram, isRightDendrogram } =
        entry;

      const leftBoundary = entry.leftBoundary!;
      const rightBoundary = entry.rightBoundary!;

      const leftPos = isLeftDendrogram ? list[left].center! : left;
      const rightPos = isRightDendrogram ? list[right].center! : right;

      const leftHeight = isLeftDendrogram ? list[left].height : -this.yShift;
      const rightHeight = isRightDendrogram ? list[right].height : -this.yShift;

      const selected =
        this.selected.has(leftBoundary) && this.selected.has(rightBoundary);
      const hovered =
        leftBoundary >= this._hoverLeftBoundary &&
        rightBoundary <= this._hoverRightBoundary;

      paths.push({
        bottomLeft: { x: leftPos, y: leftHeight },
        bottomRight: { x: rightPos, y: rightHeight },
        topLeft: { x: leftPos, y: height },
        topRight: { x: rightPos, y: height },
        leftBoundary,
        rightBoundary,
        selected,
        hovered,
        height,
      });
    }

    return paths.sort((a, b) => b.height - a.height);
  }

  private get _transformCoords(): (point: Point) => Point {
    if (this.side === Side.top) {
      return (point: Point): Point => ({
        x: point.x + this.xShift,
        y: this._viewboxHeight - point.y - this.yShift,
      });
    }

    if (this.side === Side.left) {
      return (point: Point): Point => ({
        x: this._viewboxWidth - point.y - this.yShift,
        y: point.x + this.xShift,
      });
    }

    if (this.side === Side.right) {
      return (point: Point): Point => ({
        x: point.y + this.yShift,
        y: point.x + this.xShift,
      });
    }

    return (point: Point): Point => ({
      x: point.x + this.xShift,
      y: point.y + this.yShift,
    });
  }

  private get _drawWidth(): number {
    return this._dendrogramWidth + 2 * this.xShift;
  }

  private get _drawHeight(): number {
    return this._dendrogramHeight + 2 * this.yShift;
  }

  private get _viewboxWidth(): number {
    return this._horizontal ? this._drawWidth : this._drawHeight;
  }

  private get _viewboxHeight(): number {
    return this._horizontal ? this._drawHeight : this._drawWidth;
  }
}
