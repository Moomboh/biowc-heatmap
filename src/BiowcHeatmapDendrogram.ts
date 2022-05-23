import styles from './biowc-heatmap-dendrogram.css.js';
import { Side } from './BiowcHeatmap.js';
import { BiowcHeatmapHoverableHTMLElementMixin } from './mixins/BiowcHeatmapHoverableMixin.js';
import { BiowcHeatmapSelectableHTMLElementMixin } from './mixins/BiowcHeatmapSelectableMixin.js';
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

export class BiowcHeatmapDendrogram extends BiowcHeatmapHoverableHTMLElementMixin(
  BiowcHeatmapSelectableHTMLElementMixin(HTMLElement)
) {
  side: Side = Side.bottom;

  dendrogram: DendrogramNode | DendrogramList = [];

  selectionMarkerWidth: number = 0.8;

  xShift = 0.5;

  yShift = 0.0;

  get hoveredIndices(): Set<number> {
    return this._hoveredIndices;
  }

  set hoveredIndices(value: Set<number>) {
    const oldValue = this._hoveredIndices;
    this._hoveredIndices = value;

    if (oldValue !== value) {
      this._toggleHoveredClasses();
    }
  }

  get selectedIndices(): Set<number> {
    return this._selectedIndices;
  }

  set selectedIndices(value: Set<number>) {
    const oldValue = this._selectedIndices;
    this._selectedIndices = value;

    if (oldValue !== value) {
      this._setSelectedClasses();
    }
  }

  private _hoveredIndices: Set<number> = new Set();

  private _selectedIndices: Set<number> = new Set();

  private _dendrogramList: DendrogramList = [];

  private _rootIndex = -1;

  private _horizontal: boolean = true;

  private _dendrogramWidth = 0;

  private _dendrogramHeight = 0;

  private _drawWidth = 0;

  private _drawHeight = 0;

  private _viewboxWidth = 0;

  private _viewboxHeight = 0;

  private _svgRoot: SVGSVGElement;

  private _dendrogramPathElements: SVGPathElement[] = [];

  private _transformCoords = (point: Point): Point => ({
    x: point.x + this.xShift,
    y: point.y + this.yShift,
  });

  constructor() {
    super();
    const _style = document.createElement('style');
    _style.innerHTML = styles.toString();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(_style);

    this._svgRoot = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    ) as SVGSVGElement;
  }

  async render(): Promise<void> {
    return new Promise(resolve => {
      this._horizontal = this.side === Side.top || this.side === Side.bottom;
      this._dendrogramList = this._getDendrogramList();
      this._rootIndex = this._findDendrogramListRootIndex();

      this._dendrogramWidth = calcDendrogramListWidth(this._dendrogramList);
      this._dendrogramHeight = this._dendrogramList[this._rootIndex].height;

      this._drawWidth = this._getDrawWidth();
      this._drawHeight = this._getDrawHeight();
      this._viewboxWidth = this._getViewboxWidth();
      this._viewboxHeight = this._getViewboxHeight();

      this._transformCoords = this._getTransformCoords();

      this._svgRoot.setAttribute('width', '100%');
      this._svgRoot.setAttribute('height', '100%');
      this._svgRoot.setAttribute(
        'viewBox',
        `${this.side === Side.left ? -this._viewboxWidth * 0.02 : 0}
         ${this.side === Side.top ? -this._viewboxHeight * 0.02 : 0}
         ${
           this._viewboxWidth +
           (this.side === Side.right ? this._viewboxWidth * 0.02 : 0)
         }
         ${
           this._viewboxHeight +
           (this.side === Side.bottom ? this._viewboxHeight * 0.02 : 0)
         }`
      );
      this._svgRoot.setAttribute('preserveAspectRatio', 'none');

      this._dendrogramPathElements = new Array(this._dendrogramList.length);

      this._renderDendrogram(
        this._dendrogramList[this._rootIndex],
        this._rootIndex
      );

      this.shadowRoot!.appendChild(this._svgRoot);

      resolve();
    });
  }

  private _renderDendrogram(entry: DendrogramEntry, index: number): void {
    const dendrogram = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    ) as SVGPathElement;

    const leftEntry = entry.isLeftDendrogram
      ? this._dendrogramList[entry.left]
      : null;
    const rightEntry = entry.isRightDendrogram
      ? this._dendrogramList[entry.right]
      : null;

    dendrogram.setAttribute(
      'd',
      this._getDendrogramPath(entry, leftEntry, rightEntry)
    );
    dendrogram.setAttribute('class', 'dendrogram-path');
    dendrogram.setAttribute('data-index', `${index}`);
    dendrogram.onmouseenter = this._handleDendrogramMouseEnter.bind(this);
    dendrogram.onmouseleave = this._handleDendrogramMouseLeave.bind(this);
    dendrogram.onclick = this._handleDendrogramClick.bind(this);

    this._dendrogramPathElements[index] = dendrogram;
    this._svgRoot.appendChild(dendrogram);

    if (leftEntry) {
      this._renderDendrogram(leftEntry, entry.left);
    }

    if (rightEntry) {
      this._renderDendrogram(rightEntry, entry.right);
    }
  }

  private _handleDendrogramMouseEnter(event: MouseEvent): void {
    const dendrogramPathElement = event.target as SVGPathElement;

    const index = parseInt(
      dendrogramPathElement.getAttribute('data-index')!,
      10
    );
    const dendrogramEntry = this._dendrogramList[index];
    this.hoveredIndices = new Set(
      range(dendrogramEntry.leftBoundary!, dendrogramEntry.rightBoundary!)
    );
    this._dispatchHoverEvent();
  }

  private _handleDendrogramMouseLeave(): void {
    this.hoveredIndices = new Set();
    this._dispatchHoverEvent();
  }

  private _handleDendrogramClick(): void {
    this._selectIndices(this.hoveredIndices);
    this._dispatchSelectEvent();
  }

  private _toggleHoveredClasses(): void {
    for (let i = 0; i < this._dendrogramPathElements.length; i += 1) {
      const entry = this._dendrogramList[i];
      const isHovered =
        this.hoveredIndices.has(entry.leftBoundary!) &&
        this.hoveredIndices.has(entry.rightBoundary!);

      this._dendrogramPathElements[i].classList.toggle('hovered', isHovered);
    }
  }

  private _setSelectedClasses(): void {
    for (let i = 0; i < this._dendrogramPathElements.length; i += 1) {
      const entry = this._dendrogramList[i];

      const isSelected =
        (this.selectedIndices.has(entry.leftBoundary!) &&
          this.selectedIndices.has(entry.rightBoundary!)) ||
        (this.selectedIndices.has(entry.leftBoundary!) &&
          !entry.isLeftDendrogram) ||
        (this.selectedIndices.has(entry.rightBoundary!) &&
          !entry.isRightDendrogram);

      this._dendrogramPathElements[i].classList.toggle('selected', isSelected);
    }
  }

  private _getDendrogramList() {
    if (isDendrogramNode(this.dendrogram)) {
      return calcDendrogramListCentersAndBoundaries(
        dendrogramTreeToList(this.dendrogram as DendrogramNode)
      );
    }

    return calcDendrogramListCentersAndBoundaries(
      this.dendrogram as DendrogramList
    );
  }

  private _getDrawWidth() {
    return this._dendrogramWidth + 2 * this.xShift;
  }

  private _getDrawHeight() {
    return this._dendrogramHeight + 2 * this.yShift;
  }

  private _getViewboxWidth() {
    return this._horizontal ? this._drawWidth : this._drawHeight;
  }

  private _getViewboxHeight() {
    return this._horizontal ? this._drawHeight : this._drawWidth;
  }

  private _findDendrogramListRootIndex() {
    let maxHeight = -Infinity;
    let maxIndex = -1;

    for (let i = 0; i < this._dendrogramList.length; i += 1) {
      if (this._dendrogramList[i].height >= maxHeight) {
        maxHeight = this._dendrogramList[i].height;
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  private _getTransformCoords() {
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

  private _getDendrogramPath(
    entry: DendrogramEntry,
    leftEntry: DendrogramEntry | null,
    rightEntry: DendrogramEntry | null
  ): string {
    const { left, right, height } = entry;

    const leftPos = leftEntry ? leftEntry.center! : left;
    const rightPos = rightEntry ? rightEntry.center! : right;

    const leftHeight = leftEntry ? leftEntry.height : -this.yShift;
    const rightHeight = rightEntry ? rightEntry.height : -this.yShift;

    const pointList = [
      { x: leftPos, y: leftHeight },
      { x: leftPos, y: height },
      { x: rightPos, y: height },
      { x: rightPos, y: rightHeight },
    ];

    const [bottomLeft, topLeft, topRight, bottomRight] = pointList.map(
      this._transformCoords
    );

    return `M${bottomLeft.x} ${bottomLeft.y} L${topLeft.x} ${topLeft.y} L${topRight.x} ${topRight.y} L${bottomRight.x} ${bottomRight.y}`;
  }
}
