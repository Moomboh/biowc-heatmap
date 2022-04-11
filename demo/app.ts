const PRDB_DATA_URL =
  'https://www.proteomicsdb.org/proteomicsdb/logic/getExpressionProfileHeatmapCluster.xsjs?proteins=insulin&quantification=MS1&customQuantification=&biologicalSource=tissue%3Bfluid&calculationMethod=iBAQ&customCalculationMethod=&swissprotOnly=1&noIsoforms=1&omics=Proteomics&source=db&uuid=&datasetIds=&impute=0&taxcode=9606';

interface DemoData {
  data: Array<Array<number>>;
  xLabels: Array<String>;
  yLabels: Array<String>;
}

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

  const yLabels = getRowLabels(prdbData);
  const xLabels = getColumnLabels(prdbData);
  const data = getData(prdbData);

  return {
    data,
    xLabels,
    yLabels,
  };
}
