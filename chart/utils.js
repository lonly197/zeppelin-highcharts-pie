export function getPrecisionFormat(precision, prefix) {
  return (precision === '') ? `{${prefix}:.1f}` : `{${prefix}:${precision}}`
}

export function parseNumber(oldValue) {
  let newValue = oldValue

  try {
    /** highcharts.pie only allow number type */
    if (typeof newValue !== 'number') { newValue = parseFloat(newValue) }
    if (isNaN(newValue)) { newValue = 0 }
  } catch (error) { /** ignore */ }

  return newValue
}

export function groupBy(arr, key) {
  return arr.reduce(
    (sum, item) => {
      const groupByVal = item[key];
      let groupedItems = sum.get(groupByVal) || [];
      groupedItems.push(item);
      return sum.set(groupByVal, groupedItems);
    },
    new Map()
  );
}

export function sumBy(arr, key) {
  return arr.reduce(
    (sum, item) => {
      const value = parseNumber(item[key]);
      return sum + value;
    },
    0
  );
}
