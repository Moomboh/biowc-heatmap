import { LitElement, svg, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-dendrogram.css.js';
import { Side } from './BiowcHeatmap.js';

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
  selected?: boolean;
}

export type DendrogramList = DendrogramEntry[];

type Point = { x: number; y: number };
interface DendrogramPath {
  bottomLeft: Point;
  bottomRight: Point;
  topLeft: Point;
  topRight: Point;
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

    const center =
      ((isLeftDendrogram ? list[left].center! : left) +
        (isRightDendrogram ? list[right].center! : right)) /
      2;

    const { height } = node;

    return (
      list.push({
        left,
        isLeftDendrogram,
        right,
        isRightDendrogram,
        center,
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

function calcDendrogramListCenters(list: DendrogramList): DendrogramList {
  // TODO: Maybe there is a more readable and or efficent way to do this?
  const listWithCenters: DendrogramList = Array(list.length);
  const toProcess: Array<number> = [...list.keys()];
  const stack: number[] = [];

  while (toProcess.length + stack.length > 0) {
    const index = stack.pop() || toProcess[toProcess.length - 1];
    toProcess.splice(index);
    const entry = list[index];
    const { left, right, isLeftDendrogram, isRightDendrogram } = entry;

    const leftCenter = listWithCenters[left]?.center;
    const rightCenter = listWithCenters[right]?.center;

    if (isLeftDendrogram && leftCenter === undefined) {
      stack.push(index);
      stack.push(left);
    } else if (isRightDendrogram && rightCenter === undefined) {
      stack.push(index);
      stack.push(right);
    } else if (!isLeftDendrogram && !isRightDendrogram) {
      listWithCenters[index] = {
        ...entry,
        center: (left + right) / 2,
      };
    } else if (
      isLeftDendrogram &&
      !isRightDendrogram &&
      leftCenter !== undefined
    ) {
      listWithCenters[index] = {
        ...entry,
        center: (leftCenter + right) / 2,
      };
    } else if (
      !isLeftDendrogram &&
      isRightDendrogram &&
      rightCenter !== undefined
    ) {
      listWithCenters[index] = {
        ...entry,
        center: (left + rightCenter) / 2,
      };
    } else if (
      isLeftDendrogram &&
      isRightDendrogram &&
      leftCenter !== undefined &&
      rightCenter !== undefined
    ) {
      listWithCenters[index] = {
        ...entry,
        center: (leftCenter + rightCenter) / 2,
      };
    } else {
      throw new Error('Invalid dendrogram list');
    }
  }

  return listWithCenters;
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

  render(): SVGTemplateResult {
    if (this._dendrogramList.length === 0) {
      return svg``;
    }

    return svg`
      <svg
        version="1.1"
        width="100%"
        height="100%"
        viewBox="0 0 ${this._viewboxWidth} ${this._viewboxHeight}"
        preserveAspectRatio="none"
        class="dendrogram-svg"
      >
        ${this._dendrogramPaths.map(path => this._renderPath(path))}
      </svg>
    `;
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
        <path d="
          M${bottomLeft.x} ${bottomLeft.y}
          L${topLeft.x} ${topLeft.y}
          L${topRight.x} ${topRight.y}
          L${bottomRight.x} ${bottomRight.y}
        "/>
      `;
  }

  private get _horizontal(): boolean {
    return this.side === Side.top || this.side === Side.bottom;
  }

  private get _dendrogramList(): DendrogramList {
    if (isDendrogramNode(this.dendrogram)) {
      return dendrogramTreeToList(this.dendrogram as DendrogramNode);
    }

    return calcDendrogramListCenters(this.dendrogram as DendrogramList);
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

      const leftPos = isLeftDendrogram ? list[left].center! : left;
      const rightPos = isRightDendrogram ? list[right].center! : right;

      const leftHeight = isLeftDendrogram ? list[left].height : -this.yShift;
      const rightHeight = isRightDendrogram ? list[right].height : -this.yShift;

      const bottomLeft = { x: leftPos, y: leftHeight };
      const bottomRight = { x: rightPos, y: rightHeight };
      const topLeft = { x: leftPos, y: height };
      const topRight = { x: rightPos, y: height };

      paths.push({
        bottomLeft,
        bottomRight,
        topLeft,
        topRight,
      });
    }

    return paths;
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
        x: this._viewboxWidth - (point.y + this.yShift),
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
    return this._dendrogramHeight + this.yShift;
  }

  private get _viewboxWidth(): number {
    return this._horizontal ? this._drawWidth : this._drawHeight;
  }

  private get _viewboxHeight(): number {
    return this._horizontal ? this._drawHeight : this._drawWidth;
  }
}
