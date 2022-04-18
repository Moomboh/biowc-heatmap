import { LitElement, svg, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-dendrogram.css.js';
import { Side } from './BiowcHeatmap.js';

export interface DendrogramNode {
  left: DendrogramNode | number;
  right: DendrogramNode | number;
  height: number;
  center?: number;
}

export function isDendrogramNode(object: any) {
  return (
    typeof object === 'object' &&
    typeof object.id === 'number' &&
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
}

export type DendrogramList = DendrogramEntry[];

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function calcDendrogramNodeCenters(node: DendrogramNode): DendrogramNode {
  if (typeof node.left === 'number' && typeof node.right === 'number') {
    return {
      ...node,
      center: (node.left + node.right) / 2,
    };
  }

  if (typeof node.left !== 'number' && typeof node.right === 'number') {
    const left = calcDendrogramNodeCenters(node.left);
    return {
      ...node,
      left,
      center: ((left.center as number) + node.right) / 2,
    };
  }

  if (typeof node.left === 'number' && typeof node.right !== 'number') {
    const right = calcDendrogramNodeCenters(node.right);
    return {
      ...node,
      right,
      center: (node.left + (right.center as number)) / 2,
    };
  }

  if (typeof node.left !== 'number' && typeof node.right !== 'number') {
    const left = calcDendrogramNodeCenters(node.left);
    const right = calcDendrogramNodeCenters(node.right);
    return {
      ...node,
      left,
      right,
      center: ((left.center as number) + (right.center as number)) / 2,
    };
  }

  throw new Error('Invalid dendrogram node');
}

function calcDendrogramNodeLines(node: DendrogramNode): Line[] {
  if (typeof node.left === 'number' && typeof node.right === 'number') {
    return [
      {
        x1: node.left,
        y1: node.height,
        x2: node.right,
        y2: node.height,
      },
      {
        x1: node.left,
        y1: 0,
        x2: node.left,
        y2: node.height,
      },
      {
        x1: node.right,
        y1: 0,
        x2: node.right,
        y2: node.height,
      },
    ];
  }

  if (typeof node.left !== 'number' && typeof node.right === 'number') {
    const left = calcDendrogramNodeLines(node.left);
    return [
      ...left,
      {
        x1: node.left.center as number,
        y1: node.height,
        x2: node.right,
        y2: node.height,
      },
      {
        x1: node.left.center as number,
        y1: node.left.height,
        x2: node.left.center as number,
        y2: node.height,
      },
      {
        x1: node.right,
        y1: 0,
        x2: node.right,
        y2: node.height,
      },
    ];
  }

  if (typeof node.left === 'number' && typeof node.right !== 'number') {
    const right = calcDendrogramNodeLines(node.right);
    return [
      ...right,
      {
        x1: node.left,
        y1: node.height,
        x2: node.right.center as number,
        y2: node.height,
      },
      {
        x1: node.left,
        y1: 0,
        x2: node.left,
        y2: node.height,
      },
      {
        x1: node.right.center as number,
        y1: node.right.height,
        x2: node.right.center as number,
        y2: node.height,
      },
    ];
  }

  if (typeof node.left !== 'number' && typeof node.right !== 'number') {
    const left = calcDendrogramNodeLines(node.left);
    const right = calcDendrogramNodeLines(node.right);
    return [
      ...left,
      ...right,
      {
        x1: node.left.center as number,
        y1: node.height,
        x2: node.right.center as number,
        y2: node.height,
      },
      {
        x1: node.right.center as number,
        y1: node.right.height,
        x2: node.right.center as number,
        y2: node.height,
      },
      {
        x1: node.left.center as number,
        y1: node.left.height,
        x2: node.left.center as number,
        y2: node.height,
      },
    ];
  }

  throw new Error('Invalid dendrogram node');
}

function calcDendrogramNodeWidth(node: DendrogramNode): number {
  let currentNode = node;

  while (typeof currentNode.right !== 'number') {
    currentNode = currentNode.right;
  }

  return currentNode.right;
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

    const leftCenter = listWithCenters[entry.left]?.center;
    const rightCenter = listWithCenters[entry.right]?.center;

    if (entry.isLeftDendrogram && leftCenter === undefined) {
      stack.push(index);
      stack.push(entry.left);
    } else if (entry.isRightDendrogram && rightCenter === undefined) {
      stack.push(index);
      stack.push(entry.right);
    } else if (!entry.isLeftDendrogram && !entry.isRightDendrogram) {
      listWithCenters[index] = {
        ...entry,
        center: (entry.left + entry.right) / 2,
      };
    } else if (
      entry.isLeftDendrogram &&
      !entry.isRightDendrogram &&
      leftCenter !== undefined
    ) {
      listWithCenters[index] = {
        ...entry,
        center: (leftCenter + entry.right) / 2,
      };
    } else if (
      !entry.isLeftDendrogram &&
      entry.isRightDendrogram &&
      rightCenter !== undefined
    ) {
      listWithCenters[index] = {
        ...entry,
        center: (entry.left + rightCenter) / 2,
      };
    } else if (
      entry.isLeftDendrogram &&
      entry.isRightDendrogram &&
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

function calcDendrogramListLines(list: DendrogramList): Line[] {
  const lines: Line[] = [];

  for (const entry of list) {
    if (!entry.isLeftDendrogram && !entry.isRightDendrogram) {
      lines.push({
        x1: entry.left,
        y1: entry.height,
        x2: entry.right,
        y2: entry.height,
      });
      lines.push({
        x1: entry.left,
        y1: 0,
        x2: entry.left,
        y2: entry.height,
      });
      lines.push({
        x1: entry.right,
        y1: 0,
        x2: entry.right,
        y2: entry.height,
      });
    }

    if (entry.isLeftDendrogram && !entry.isRightDendrogram) {
      const leftEntry = list[entry.left];
      const left = leftEntry.center ?? 0;
      lines.push({
        x1: left,
        y1: entry.height,
        x2: entry.right,
        y2: entry.height,
      });
      lines.push({
        x1: left,
        y1: leftEntry.height,
        x2: left,
        y2: entry.height,
      });
      lines.push({
        x1: entry.right,
        y1: 0,
        x2: entry.right,
        y2: entry.height,
      });
    }

    if (!entry.isLeftDendrogram && entry.isRightDendrogram) {
      const rightEntry = list[entry.right];
      const right = rightEntry.center ?? 0;
      lines.push({
        x1: entry.left,
        y1: entry.height,
        x2: right,
        y2: entry.height,
      });
      lines.push({
        x1: entry.left,
        y1: 0,
        x2: entry.left,
        y2: entry.height,
      });
      lines.push({
        x1: right,
        y1: rightEntry.height,
        x2: right,
        y2: entry.height,
      });
    }

    if (entry.isLeftDendrogram && entry.isRightDendrogram) {
      const leftEntry = list[entry.left];
      const rightEntry = list[entry.right];
      const left = leftEntry.center ?? 0;
      const right = rightEntry.center ?? 0;
      lines.push({
        x1: left,
        y1: entry.height,
        x2: right,
        y2: entry.height,
      });
      lines.push({
        x1: left,
        y1: leftEntry.height,
        x2: left,
        y2: entry.height,
      });
      lines.push({
        x1: right,
        y1: rightEntry.height,
        x2: right,
        y2: entry.height,
      });
    }
  }

  return lines;
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

export class BiowcHeatmapDendrogram extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  side: Side = Side.top;

  @property({ attribute: false })
  dendrogram: DendrogramNode | DendrogramList | undefined;

  render(): SVGTemplateResult {
    if (this.dendrogram !== undefined) {
      const isLeft = this.side === Side.left;
      const isRight = this.side === Side.right;
      const isBottom = this.side === Side.bottom;
      const vertical = isLeft || isRight;

      const rotation = isBottom || isLeft ? 180 : 0;
      const scaleX = isBottom ? -1 : 1;
      const scaleY = isRight ? 1 : -1;

      const width = vertical ? this._dendrogramHeight : this._dendrogramWidth;
      const height = vertical ? this._dendrogramWidth : this._dendrogramHeight;

      const xPadding = vertical ? width * 0.05 : 0;
      const yPadding = vertical ? 0 : height * 0.05;

      return svg`
        <svg
          version="1.1"
          width="100%"
          height="100%"
          viewBox="0 0 ${width + xPadding} ${height + yPadding}"
          preserveAspectRatio="none"
          class="dendrogram-svg"
        >
          <g
            transform="
              scale(${scaleX}, ${scaleY})
              rotate(${rotation})
            "
            transform-origin="center"
          >
            ${this._dendrogramLines.map(line => {
              const x1 = vertical ? line.y1 : line.x1 + 0.5;
              const x2 = vertical ? line.y2 : line.x2 + 0.5;
              const y1 = vertical ? line.x1 + 0.5 : line.y1;
              const y2 = vertical ? line.x2 + 0.5 : line.y2;

              return svg`
                <line
                  x1=${x1 + xPadding / 2}
                  y1=${y1 + yPadding / 2}
                  x2=${x2 + xPadding / 2}
                  y2=${y2 + yPadding / 2}
                  stroke="black"
                  stroke-width="2px"
                  vector-effect="non-scaling-stroke"
                />
                `;
            })}
            )}
          </g>
        </svg>
      `;
    }

    return svg``;
  }

  private get _dendrogramWithCenters(): DendrogramNode | DendrogramList {
    if (isDendrogramNode(this.dendrogram)) {
      return calcDendrogramNodeCenters(this.dendrogram! as DendrogramNode);
    }

    return calcDendrogramListCenters(this.dendrogram! as DendrogramList);
  }

  private get _dendrogramLines(): Line[] {
    if (isDendrogramNode(this.dendrogram)) {
      return calcDendrogramNodeLines(
        this._dendrogramWithCenters as DendrogramNode
      );
    }

    return calcDendrogramListLines(
      this._dendrogramWithCenters as DendrogramList
    );
  }

  private get _dendrogramHeight(): number {
    if (isDendrogramNode(this.dendrogram)) {
      return (this._dendrogramWithCenters as DendrogramNode).height;
    }

    return calcDendrogragramListMaxHeight(
      this._dendrogramWithCenters as DendrogramList
    );
  }

  private get _dendrogramWidth(): number {
    if (isDendrogramNode(this.dendrogram)) {
      return (
        calcDendrogramNodeWidth(this._dendrogramWithCenters as DendrogramNode) +
        1
      );
    }

    return (
      calcDendrogramListWidth(this._dendrogramWithCenters as DendrogramList) + 1
    );
  }
}
