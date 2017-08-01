export const CommonParameter = {
  'showLegend': { valueType: 'boolean', defaultValue: true, description: 'show legend', widget: 'checkbox', },
  'legendPosition': { valueType: 'string', defaultValue: 'bottom', description: 'position of legend', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'legendLayout': { valueType: 'string', defaultValue: 'horizontal', description: 'layout of legend', widget: 'option', optionValues: [ 'horizontal', 'vertical', ], },
  'legendLabelFormat': { valueType: 'string', defaultValue: '', description: 'text format of legend (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'mainTitle': { valueType: 'string', defaultValue: '', description: 'main title of chart', },
  'subTitle': { valueType: 'string', defaultValue: '', description: 'sub title of chart', },
  'valueUnit': { valueType: 'string', defaultValue: '', description: 'unit of value', },
  'dataLabelType': { valueType: 'string', defaultValue: 'outside', description: 'display type of data label', widget: 'option', optionValues: [ 'outside', 'inside', ], },
  'dataLabelPrecision': { valueType: 'string', defaultValue: '.2f', description: 'precision of data label format without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'tooltipPercentPrecision': { valueType: 'string', defaultValue: '.2f', description: 'precision of tooltip percentage without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'tooltipValuePrecision': { valueType: 'string', defaultValue: '.1f', description: 'precision of tooltip value without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
}

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

export function createDrilldownDataStructure(rows, seriesName) {
  const drillDownSeries = []
  const data = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const selector = row.selector


    const drillDownData = row.drillDown.map(dr => {
      const drillDownValue = parseNumber(dr.value)
      return [ dr.group, drillDownValue, ]
    })
    drillDownSeries.push({ name: selector, id: selector, data: drillDownData, })

    let seriesValue = parseNumber(row.value)

    const useDrillDown = (row.drillDown && row.drillDown.length > 0)
    data.push({ name: selector, y: seriesValue, drilldown: (useDrillDown) ? selector : null, })
  }

  const series = []
  series.push({ name: 'Total', colorByPoint: true, data: data, })

  return { series: series, drillDownSeries: drillDownSeries, }
}

export function createPieChartOption(series, drillDownSeries, parameter) {
  const {
    mainTitle, subTitle,
    valueUnit,
    legendLayout, legendPosition, showLegend, legendLabelFormat,
    dataLabelType, dataLabelPrecision, tooltipPercentPrecision, tooltipValuePrecision,
  } = parameter

  const option = {
    chart: { type: 'pie' },
    title: { text: ' ', },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: `{point.name}: ${getPrecisionFormat(dataLabelPrecision, 'point.percentage')}%`
        }
      },
      pie: {
        allowPointSelect: true, cursor: 'pointer',
        dataLabels: { enabled: false, },
        showInLegend: true
      }
    },
    legend: { enabled: showLegend, labelFormat: '{name}', },
    tooltip: {
      headerFormat: `
        <span style="font-size:11px">{series.name}: (${getPrecisionFormat(tooltipValuePrecision, 'point.total')}${valueUnit !== '' ? ' ' + valueUnit : ''})</span><br>`,
      pointFormat: `
        <span style="color:{point.color}">{point.name}</span>: <b>${getPrecisionFormat(tooltipPercentPrecision, 'point.percentage')}%</b>
        (${getPrecisionFormat(tooltipValuePrecision, 'point.y')}${valueUnit !== '' ? ' ' +valueUnit : ''})`
    },
    series: series,
    drilldown: { series: drillDownSeries, },
  }

  if (mainTitle !== '') { option.title.text = mainTitle  }
  if (subTitle !== '') { option.subtitle = { text: subTitle, } }
  if (legendPosition === 'top') { option.legend.verticalAlign = 'top' }
  if (legendLayout === 'vertical') { option.legend.layout = legendLayout }
  if (legendLabelFormat !== '') { option.legend.labelFormat = legendLabelFormat }

  if (dataLabelType === 'inside') {
    option.plotOptions.pie.dataLabels = {
      enabled: true, distance: -50,
      style: { fontWeight: 'bold', color: 'white' },
    }
  }

  return option
}
