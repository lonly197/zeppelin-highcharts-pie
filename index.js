import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'

import Highcharts from 'highcharts/highcharts'
require('highcharts/modules/data')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);

// http://stackoverflow.com/questions/42076332/uncaught-typeerror-e-dodrilldown-is-not-a-function-highcharts
import Drilldown from 'highcharts/modules/drilldown'
if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) { Drilldown(Highcharts) }

import { CommonParameter, parseNumber, createPieChartOption, } from './chart/pie'

import { DonutParameter, createDonutChartOption } from './chart/donut'
import { HalfDonutParameter, createHalfDonutChartOption } from './chart/harf-donut'


export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    this.columnSelectorProps = [
      { name: 'category' },
      { name: 'value' },
      { name: 'drilldown' },
    ]

    this.parameter = {
      charts: {
        'pie': {
          transform: { method: 'drill-down', },
          sharedAxis: true,
          axis: {
            'category': { dimension: 'multiple', axisType: 'key', },
            'value': { dimension: 'multiple', axisType: 'aggregator', minAxisCount: 1, },
            'drill-down': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        }
      }
    }

    this.transformation = new ColumnselectorTransformation(
      config, this.columnSelectorProps)

  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.destroy() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  showError(error) {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 300">
            <span style="font-size:30px; color: #e4573c;">
                ${error.message} 
            </span>
        </div>`
  }

  drawPieChart(parameter, conf, rows) {
    const column = conf.value
    if (!column || column.aggr.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { series, drillDownSeries, } = createDrilldownDataStructure(rows, conf)
    const chartOption = createPieChartOption(series, drillDownSeries, parameter)
    console.info('pie-chartOption', chartOption)
    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  /**
   * @param tableData {Object} includes cols and rows. For example,
   *                           `{columns: Array[2], rows: Array[11], comment: ""}`
   *
   * Each column includes `aggr`, `index`, `name` fields.
   *  For example, `{ aggr: "sum", index: 0, name: "age"}`
   *
   * Each row is an array including values.
   *  For example, `["19", "4"]`
   */
  render(tableData) {
    console.info('pie-tableData', tableData)
    console.info('pie-conf', this.config)
    const conf = this.config

    /** heatmap can be rendered when all 3 axises are defined */
    if (!conf.category || !conf.value) {
      return
    }

    const { rows, } = tableData
    const parameter = this.parameter

    try {
      this.drawPieChart(parameter, conf, rows)
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  getTransformation() {
    return this.transformation
  }
}

export function createDrilldownDataStructure(rows, conf) {
  const { category, value, drilldown } = conf
  const useDrillDown = (drilldown && drilldown.aggr.length > 0)
  const selector = parseNumber(value.index)
  const seriesName = category.name
  const drillDownSeries = []
  const data = []
  console.info('category',category)
  console.info('value',value)
  console.info('drilldown',drilldown)
  console.info('useDrillDown',useDrillDown)
  console.info('selector',selector)
  console.info('seriesName',seriesName)

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    const drillDownData = (useDrillDown) ? rows.map(dr => {
      const drillDownValue = parseNumber(dr[this.selector])
      return [dr[this.drilldown.Index], drillDownValue,]
    }) : null
    drillDownSeries.push({ name: seriesName, id: seriesName, data: drillDownData, })

    let seriesValue = parseNumber(row[selector])

    data.push({ name: seriesName, y: seriesValue, drilldown: (useDrillDown) ? seriesName : null, })
  }

  const series = []
  series.push({ name: 'Total', colorByPoint: true, data: data, })

  return { series: series, drillDownSeries: drillDownSeries, }
}
