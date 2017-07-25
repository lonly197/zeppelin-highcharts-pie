import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'

import Highcharts from 'highcharts/highcharts'
require('highcharts/modules/data')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);

// http://stackoverflow.com/questions/42076332/uncaught-typeerror-e-dodrilldown-is-not-a-function-highcharts
import Drilldown from 'highcharts/modules/drilldown'
if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) { Drilldown(Highcharts) }

import { CommonParameter, createDrilldownDataStructure, createPieChartOption, } from './chart/pie'

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

  drawPieChart(parameter, column, transformer) {
    if (column.aggr.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, } = transformer()

    const { series, drillDownSeries, } = createDrilldownDataStructure(rows)
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
    console.info('tableData', tableData)
    console.info('conf',this.config)
    const conf = this.config

    /** heatmap can be rendered when all 3 axises are defined */
    if (!conf.category || !conf.value) {
      return
    }

    const { columns, rows } = tableData
    const column = columns.find(p=>p.name == conf.value)

    try {
      this.drawPieChart(this.getParameter(), column, this.getTransformation())
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  getTransformation() {
    return this.transformation
  }

  getParameter() {
    return this.parameter
  }
}
