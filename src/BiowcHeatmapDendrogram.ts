import { LitElement, svg, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-dendrogram.css.js';
import range from './util/range.js';
import { computed } from './util/computedDecorator.js';
import { Side } from './BiowcHeatmap.js';
import BiowcHeatmapSelectableMixin from './mixins/BiowcHeatmapSelectableMixin.js';
import BiowcHeatmapHoverableMixin from './mixins/BiowcHeatmapHoverableMixin.js';

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
  isLeftDendrogram: boolean;
  isRightDendrogram: boolean;
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

export class BiowcHeatmapDendrogram extends BiowcHeatmapSelectableMixin(
  BiowcHeatmapHoverableMixin(LitElement)
) {
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

  render(): SVGTemplateResult {
    if (this._dendrogramList.length === 0) {
      return svg``;
    }

    return svg`
      <svg
        width="100%"
        height="100%"
        viewBox="
         ${this.side === Side.left ? -this._viewboxWidth * 0.02 : 0}
         ${this.side === Side.top ? -this._viewboxHeight * 0.02 : 0}
         ${
           this._viewboxWidth +
           (this.side === Side.right ? this._viewboxWidth * 0.02 : 0)
         }
         ${
           this._viewboxHeight +
           (this.side === Side.bottom ? this._viewboxHeight * 0.02 : 0)
         }
        "
        preserveAspectRatio="none"
      >
        ${this._dendrogramPaths.map((path, index) =>
          this._renderPath(path, index)
        )}
        ${[...this.selectedIndices].map(index => this._renderSelected(index))}]}
      </svg>
    `;
  }

  private _renderPath(
    path: DendrogramPath,
    pathIndex: number
  ): SVGTemplateResult {
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
            dendrogram-path
            ${this._hoveredPathIndices.has(pathIndex) ? 'hovered' : ''}
            ${this._selectedPathIndices.has(pathIndex) ? 'selected' : ''}
          "
          d="
            M${bottomLeft.x} ${bottomLeft.y}
            L${topLeft.x} ${topLeft.y}
            L${topRight.x} ${topRight.y}
            L${bottomRight.x} ${bottomRight.y}
          "
          @mouseenter="${this._handlePathMouseenter(
            path.leftBoundary,
            path.rightBoundary
          )}"
          @mouseleave="${this._handlePathMouseleave}"
          @click="${this._handlePathClick}"
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
        class="
          selection-marker
          ${this.hoveredIndices.has(index) ? 'hovered' : ''}
          ${this.selectedIndices.has(index) ? 'selected' : ''}
        "
        x1="${from.x}"
        y1="${from.y}"
        x2="${to.x}"
        y2="${to.y}"
      />
    `;
  }

  private _handlePathMouseenter(leftBoundary: number, rightBoundary: number) {
    return () => {
      this.hoveredIndices = new Set([...range(leftBoundary, rightBoundary)]);
      this._dispatchHoverEvent();
    };
  }

  private _handlePathMouseleave() {
    this.hoveredIndices = new Set();
    this._dispatchHoverEvent();
  }

  private _handlePathClick() {
    this._selectIndices(this.hoveredIndices);
  }

  @computed('side')
  private get _horizontal(): boolean {
    return this.side === Side.top || this.side === Side.bottom;
  }

  @computed('dendrogram')
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

  @computed('_dendrogramList')
  private get _dendrogramWidth(): number {
    return calcDendrogramListWidth(this._dendrogramList);
  }

  @computed('_dendrogramList')
  private get _dendrogramHeight(): number {
    return calcDendrogragramListMaxHeight(this._dendrogramList);
  }

  @computed('_dendrogramWidth', 'xShift')
  private get _drawWidth(): number {
    return this._dendrogramWidth + 2 * this.xShift;
  }

  @computed('_dendrogramHeight', 'yShift')
  private get _drawHeight(): number {
    return this._dendrogramHeight + 2 * this.yShift;
  }

  @computed('_horizontal', '_drawWidth', '_drawHeight')
  private get _viewboxWidth(): number {
    return this._horizontal ? this._drawWidth : this._drawHeight;
  }

  @computed('_horizontal', '_drawHeight', '_drawWidth')
  private get _viewboxHeight(): number {
    return this._horizontal ? this._drawHeight : this._drawWidth;
  }

  @computed('side', 'xShift', 'yShift', '_viewboxWidth', '_viewboxHeight')
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

  @computed('_dendrogramList', 'yShift', 'xShift')
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

      paths.push({
        bottomLeft: { x: leftPos, y: leftHeight },
        bottomRight: { x: rightPos, y: rightHeight },
        topLeft: { x: leftPos, y: height },
        topRight: { x: rightPos, y: height },
        leftBoundary,
        rightBoundary,
        isLeftDendrogram,
        isRightDendrogram,
        height,
      });
    }

    return paths.sort((a, b) => b.height - a.height);
  }

  @computed('_dendrogramPaths', 'selectedIndices')
  private get _selectedPathIndices(): Set<number> {
    const selectedIndices = new Set<number>();

    for (const [index, path] of this._dendrogramPaths.entries()) {
      const selected =
        (this.selectedIndices.has(path.leftBoundary) &&
          this.selectedIndices.has(path.rightBoundary)) ||
        (this.selectedIndices.has(path.leftBoundary) &&
          !path.isLeftDendrogram) ||
        (this.selectedIndices.has(path.rightBoundary) &&
          !path.isRightDendrogram);

      if (selected) {
        selectedIndices.add(index);
      }
    }

    return selectedIndices;
  }

  @computed('_dendrogramPaths', 'hoveredIndices')
  private get _hoveredPathIndices(): Set<number> {
    const hoveredIndices = new Set<number>();

    for (const [index, path] of this._dendrogramPaths.entries()) {
      const hovered =
        this.hoveredIndices.has(path.leftBoundary) &&
        this.hoveredIndices.has(path.rightBoundary);

      if (hovered) {
        hoveredIndices.add(index);
      }
    }

    return hoveredIndices;
  }
}
