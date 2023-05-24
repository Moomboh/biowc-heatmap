import { AxisLabels } from '../src/BiowcHeatmap.js';
import { ColorLabels } from '../src/BiowcHeatmapColorAnnot.js';
import {
  DendrogramList,
  DendrogramNode,
} from '../src/BiowcHeatmapDendrogram.js';

export interface DemoData {
  data: (number | null)[][];
  xLabels: string[];
  yLabels: string[];
  xDendrogram: DendrogramNode | DendrogramList;
  yDendrogram: DendrogramNode | DendrogramList;
  xAnnotColors: string[];
  yAnnotColors?: string[];
  xAnnotColorLabels?: ColorLabels;
  axisLabels: AxisLabels;
  minValue: number;
  maxValue: number;
}

type ClusterDataEntry = [
  number | string,
  boolean,
  number | string,
  boolean,
  number
];

type ClusterIdMapFunction = (id: number | string) => number;

type ColorMap = { [key: string]: string };

const tissueColorMap: ColorMap = {
  tissue: 'rgb(31, 119, 180)',
  fluid: 'rgb(255, 127, 14)',
  'cell line': 'rgb(44, 160, 44)',
};

function getRowLabels(prdbData: any): string[] {
  function getLabel(proteinId: String): String {
    const protein = prdbData.proteindata.filter(
      (proteinData: any[]) => proteinData[0] === proteinId
    )[0];
    return protein[2];
  }

  return prdbData.clusterdata.proteinorder.map((proteinId: String) =>
    getLabel(proteinId)
  );
}

function getColumnLabels(prdbData: any): string[] {
  function getLabel(tissueId: String): String {
    const tissue = prdbData.tissuedata.filter(
      (tissueData: any[]) => tissueData[0] === tissueId
    )[0];
    return tissue[1];
  }

  return prdbData.clusterdata.tissueorder.map((tissueId: String) =>
    getLabel(tissueId)
  );
}

function getDendrogramList(
  clusterdata: ClusterDataEntry[],
  idToIndex: ClusterIdMapFunction
): DendrogramList {
  return clusterdata.map(entry => ({
    left: entry[1] ? (entry[0] as number) : idToIndex(entry[0]),
    isLeftDendrogram: entry[1],
    right: entry[3] ? (entry[2] as number) : idToIndex(entry[2]),
    isRightDendrogram: entry[3],
    height: entry[4],
  }));
}

function getData(prdbData: any): { values: (number | null)[][], maxValue: number } {
  const values: (number | null)[][] = Array(prdbData.clusterdata.proteinorder.length);
  let maxValue = -Infinity;

  for (const [i, proteinId] of prdbData.clusterdata.proteinorder.entries()) {
    const row: (number | null)[] = Array(prdbData.clusterdata.tissueorder.length);

    for (const [j, tissueId] of prdbData.clusterdata.tissueorder.entries()) {
      const filteredData = prdbData.mapdata.filter(
        (mapData: any[]) => mapData[0] === proteinId && mapData[1] === tissueId
      );

      if (filteredData.length === 0) {
        if (Math.random() > 0.5) {
          row[j] = null;
        } else {
          row[j] = 0
        }

      } else {
        // eslint-disable-next-line prefer-destructuring
        row[j] = filteredData[0][3];
      }

      const val = row[j];
      if (val != null && val > maxValue) {
        maxValue = val;
      }
    }

    values[i] = row;
  }

  return {
    values,
    maxValue
  }
}

function getXAnnotColors(tissuedata: any) {
  return tissuedata.map(
    (tissueData: string[]) => tissueColorMap[tissueData[3]]
  );
}

export async function fetchDemoData(url: string): Promise<DemoData> {
  const response = await fetch(url);
  const prdbData = await response.json();

  const data = getData(prdbData);
  const yLabels = getRowLabels(prdbData);
  const xLabels = getColumnLabels(prdbData);

  const xDendrogram = getDendrogramList(
    prdbData.clusterdata.tissuecluster,
    id => (prdbData.clusterdata.tissueorder as Array<any>).indexOf(id)
  );

  const yDendrogram = getDendrogramList(
    prdbData.clusterdata.proteincluster,
    id => (prdbData.clusterdata.proteinorder as Array<any>).indexOf(id)
  );

  const xAnnotColors = getXAnnotColors(prdbData.tissuedata);

  const xAnnotColorLabels = Object.fromEntries(
    Object.entries(tissueColorMap).map(x => x.reverse())
  );

  return {
    data: data.values,
    minValue: 0,
    maxValue: data.maxValue,
    xLabels,
    yLabels,
    xDendrogram,
    yDendrogram,
    xAnnotColors,
    xAnnotColorLabels,
    axisLabels: {
      top: 'Sample source',
      left: 'Protein',
    },
  };
}
