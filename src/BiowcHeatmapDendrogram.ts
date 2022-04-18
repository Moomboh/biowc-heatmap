import { LitElement, svg, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './biowc-heatmap-dendrogram.css.js';
import { Side } from './BiowcHeatmap.js';

export interface DendrogramNode {
  id: number;
  left: DendrogramNode | number;
  right: DendrogramNode | number;
  height: number;
  center?: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function calcDendrogramCenters(node: DendrogramNode): DendrogramNode {
  if (typeof node.left === 'number' && typeof node.right === 'number') {
    return {
      ...node,
      center: (node.left + node.right) / 2,
    };
  }

  if (typeof node.left !== 'number' && typeof node.right === 'number') {
    const left = calcDendrogramCenters(node.left);
    return {
      ...node,
      left,
      center: ((left.center as number) + node.right) / 2,
    };
  }

  if (typeof node.left === 'number' && typeof node.right !== 'number') {
    const right = calcDendrogramCenters(node.right);
    return {
      ...node,
      right,
      center: (node.left + (right.center as number)) / 2,
    };
  }

  if (typeof node.left !== 'number' && typeof node.right !== 'number') {
    const left = calcDendrogramCenters(node.left);
    const right = calcDendrogramCenters(node.right);
    return {
      ...node,
      left,
      right,
      center: ((left.center as number) + (right.center as number)) / 2,
    };
  }

  throw new Error('Invalid dendrogram node');
}

function calcDendrogramLines(node: DendrogramNode): Line[] {
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
    const left = calcDendrogramLines(node.left);
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
    const right = calcDendrogramLines(node.right);
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
    const left = calcDendrogramLines(node.left);
    const right = calcDendrogramLines(node.right);
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

export class BiowcHeatmapDendrogram extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  side: Side = Side.top;

  @property({ attribute: false })
  dendrogram: DendrogramNode | undefined;

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

  private get _dendrogramWithCenters(): DendrogramNode {
    return calcDendrogramCenters(this.dendrogram!);
  }

  private get _dendrogramLines(): Line[] {
    return calcDendrogramLines(this._dendrogramWithCenters);
  }

  private get _dendrogramHeight(): number {
    return this._dendrogramWithCenters.height;
  }

  private get _dendrogramWidth(): number {
    let currentNode = this._dendrogramWithCenters;

    while (typeof currentNode.right !== 'number') {
      currentNode = currentNode.right;
    }

    return currentNode.right + 1;
  }
}
