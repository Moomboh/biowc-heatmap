import { DendrogramNode } from '../src/BiowcHeatmap.js';

const PRDB_DATA_URL =
  'https://www.proteomicsdb.org/proteomicsdb/logic/getExpressionProfileHeatmapCluster.xsjs?proteins=insulin&quantification=MS1&customQuantification=&biologicalSource=tissue%3Bfluid&calculationMethod=iBAQ&customCalculationMethod=&swissprotOnly=1&noIsoforms=1&omics=Proteomics&source=db&uuid=&datasetIds=&impute=0&taxcode=9606';

interface DemoData {
  data: Array<Array<number>>;
  xLabels: Array<String>;
  yLabels: Array<String>;
  xDendrogram: DendrogramNode;
  yDendrogram: DendrogramNode;
}

type ClusterDataEntry = [
  number | string,
  boolean,
  number | string,
  boolean,
  number
];

type ClusterIdMapFunction = (id: number | string) => number;

function getRowLabels(prdbData: any): Array<String> {
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

function getColumnLabels(prdbData: any): Array<String> {
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

function getDendrogram(
  clusterdata: ClusterDataEntry[],
  idToIndex: ClusterIdMapFunction
): DendrogramNode {
  let entryCounter = -1;

  function parseEntry(entry: ClusterDataEntry): DendrogramNode {
    entryCounter += 1;

    if (!entry[1] && !entry[3]) {
      return {
        id: entryCounter,
        left: idToIndex(entry[2]),
        right: idToIndex(entry[0]),
        height: entry[4],
      } as DendrogramNode;
    }

    if (entry[1] && !entry[3]) {
      const rightEntry = clusterdata[entry[0] as number];
      return {
        id: entryCounter,
        left: idToIndex(entry[2]),
        right: parseEntry(rightEntry),
        height: entry[4],
      } as DendrogramNode;
    }

    if (!entry[1] && entry[3]) {
      const leftEntry = clusterdata[entry[2] as number];
      return {
        id: entryCounter,
        left: parseEntry(leftEntry),
        right: idToIndex(entry[0]),
        height: entry[4],
      } as DendrogramNode;
    }

    const leftEntry = clusterdata[entry[2] as number];
    const rightEntry = clusterdata[entry[0] as number];
    return {
      id: entryCounter,
      left: parseEntry(leftEntry),
      right: parseEntry(rightEntry),
      height: entry[4],
    } as DendrogramNode;
  }

  const lastEntry = clusterdata[clusterdata.length - 1];
  return parseEntry(lastEntry);
}

function getData(prdbData: any): Array<Array<number>> {
  const data: Array<Array<number>> = prdbData.clusterdata.proteinorder.map(
    (proteinId: number) =>
      prdbData.clusterdata.tissueorder.map((tissueId: String) => {
        const filteredData = prdbData.mapdata.filter(
          (mapData: any[]) =>
            mapData[0] === proteinId && mapData[1] === tissueId
        );

        if (filteredData.length === 0) {
          return 0;
        }

        return filteredData[0][3];
      })
  );

  const maxValue = Math.max(...data.flat());

  return data.map(row => row.map(value => value / maxValue));
}

export async function fetchDemoData(): Promise<DemoData> {
  const response = await fetch(PRDB_DATA_URL);
  const prdbData = await response.json();

  const data = getData(prdbData);
  const yLabels = getRowLabels(prdbData);
  const xLabels = getColumnLabels(prdbData);

  const xDendrogram = getDendrogram(prdbData.clusterdata.tissuecluster, id =>
    (prdbData.clusterdata.tissueorder as Array<any>).indexOf(id)
  );

  const yDendrogram = getDendrogram(prdbData.clusterdata.proteincluster, id =>
    (prdbData.clusterdata.proteinorder as Array<any>).indexOf(id)
  );

  return {
    data,
    xLabels,
    yLabels,
    xDendrogram,
    yDendrogram,
  };
}
