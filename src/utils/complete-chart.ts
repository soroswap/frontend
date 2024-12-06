type DataItem = {
  date: string;
  [key: string]: any;
};

/* Complete the data with all the dates between the first and last date
 * Useful for filling the gaps in a chart
 *
 *  Example:
 *      const rawData: DataItem[] = [
 *          { date: "2024-03-11", tvl: 2651.25 },
 *          ...
 *      ];
 *
 *  const completeData = fillDatesAndSort(rawData, "tvl");
 */
export function fillDatesAndSort(
  data: DataItem[],
  valueKey: string,
  fillWithLastValue = true
): DataItem[] {
  if (data.length === 0) {
    return [];
  }

  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const completeData: DataItem[] = [];
  let currentDate = new Date(sortedData[0].date);
  const today = new Date();

  sortedData.forEach((item, index) => {
    const itemDate = new Date(item.date);
    while (currentDate < itemDate) {
      let lastValue = 0;
      let lastValueA = 0;
      let lastValueB = 0;

      if (fillWithLastValue) {
        lastValue =
          completeData.length > 0
            ? completeData[completeData.length - 1][valueKey]
            : item[valueKey];

        lastValueA =
          completeData.length > 0
            ? completeData[completeData.length - 1].valueA
            : item.valueA;

        lastValueB =
          completeData.length > 0
            ? completeData[completeData.length - 1].valueB
            : item.valueB;
      }

      completeData.push({
        date: currentDate.toISOString().split("T")[0],
        [valueKey]: lastValue,
        valueA: lastValueA,
        valueB: lastValueB,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    completeData.push({ ...item });
    currentDate.setDate(currentDate.getDate() + 1);
  });

  while (currentDate <= today) {
    let lastValue = 0;
    let lastValueA = 0;
    let lastValueB = 0;

    if (fillWithLastValue && completeData.length > 0) {
      lastValue = completeData[completeData.length - 1][valueKey];
      lastValueA = completeData[completeData.length - 1].valueA;
      lastValueB = completeData[completeData.length - 1].valueB;
    }

    completeData.push({
      date: currentDate.toISOString().split("T")[0],
      [valueKey]: lastValue,
      valueA: lastValueA,
      valueB: lastValueB,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return completeData;
}

export const getLastValuePerDate = (data: any[]): any[] => {
  const formatDate = (dateStr: string) => dateStr.split("T")[0];

  const dateMap = new Map<string, any>();

  data.forEach((item) => {
    const dateKey = formatDate(item.date);
    dateMap.set(dateKey, item);
  });

  const result = Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return result;
};

export const fillDatesTillToday = (
  data: DataItem[],
  valueKey: string,
  fillWithLastValue = true
): DataItem[] => {
  if (data.length === 0) {
    return [];
  }

  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const completeData: DataItem[] = [];

  let currentDate = new Date(sortedData[0].date);
  const firstValue = sortedData[0][valueKey];
  const valueA = sortedData[0]?.valueA;
  const valueB = sortedData[0]?.valueB;

  while (currentDate < new Date()) {
    let lastValue = completeData.length > 0 ? 0 : firstValue;
    let lasValueA = completeData.length > 0 ? 0 : valueA;
    let lasValueB = completeData.length > 0 ? 0 : valueB;

    if (fillWithLastValue) {
      lastValue =
        completeData.length > 0
          ? completeData[completeData.length - 1][valueKey]
          : sortedData[0][valueKey];

      lasValueA =
        completeData.length > 0
          ? completeData[completeData.length - 1].valueA
          : sortedData[0].valueA;

      lasValueB =
        completeData.length > 0
          ? completeData[completeData.length - 1].valueB
          : sortedData[0].valueB;
    }

    completeData.push({
      date: currentDate.toISOString().split("T")[0],
      [valueKey]: lastValue,
      valueA: lasValueA,
      valueB: lasValueB,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return completeData;
};

export const fillChart = (data: any, key: string, fillWithLastValue = true) => {
  const filteredTvlChartData = getLastValuePerDate(data);

  if (filteredTvlChartData.length === 1) {
    return fillDatesTillToday(data, key, fillWithLastValue);
  }

  return fillDatesAndSort(filteredTvlChartData, key, fillWithLastValue);
};
