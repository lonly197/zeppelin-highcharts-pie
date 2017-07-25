import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'

import Highcharts from 'highcharts/highcharts'
require('highcharts/modules/data')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);

// http://stackoverflow.com/questions/42076332/uncaught-typeerror-e-dodrilldown-is-not-a-function-highcharts
import Drilldown from 'highcharts/modules/drilldown'
if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) { Drilldown(Highcharts) }

import { CommonParameter, createPieChartOption, } from './chart/pie'

import { DonutParameter, createDonutChartOption } from './chart/donut'
import { HalfDonutParameter, createHalfDonutChartOption } from './chart/harf-donut'


export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    this.columnSelectorProps = [
      { name: 'category' },
      { name: 'value' },
      { name: 'drill-down' },
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

  drawPieChart(parameter, column, rows) {
    if (column.aggr.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { series, drillDownSeries, } = createDrilldownDataStructure(rows)
    console.info('pie-series',series)
    console.info('pie-drillDownSeries',drillDownSeries)
    const chartOption = createPieChartOption(series, drillDownSeries, parameter)
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

    const { columns, rows } = tableData
    const parameter = this.parameter
    const column = conf.value

    try {
      this.drawPieChart(parameter, column, rows)
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  getTransformation() {
    return this.transformation
  }
}

export function createDrilldownDataStructure(rows, seriesName) {
  const drillDownSeries = []
  const data = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const selector = row.selector

    const useDrillDown = (row.drillDown && row.drillDown.length > 0)

    const drillDownData = (useDrillDown) ?row.drillDown.map(dr => {
      const drillDownValue = parseNumber(dr.value)
      return [ dr.group, drillDownValue, ]
    }):[]
    drillDownSeries.push({ name: selector, id: selector, data: drillDownData, })

    let seriesValue = parseNumber(row.value)

   
    data.push({ name: selector, y: seriesValue, drilldown: (useDrillDown) ? selector : null, })
  }

  const series = []
  series.push({ name: 'Total', colorByPoint: true, data: data, })

  return { series: series, drillDownSeries: drillDownSeries, }
}
