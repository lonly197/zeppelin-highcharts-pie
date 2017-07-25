import { CommonParameter, createPieChartOption, } from './pie'

const p = JSON.parse(JSON.stringify(CommonParameter))
p.innerSize = { valueType: 'int', defaultValue: 50, description: 'inner size of donut', }
delete p.subTitle
export const DonutParameter = p

export function createDonutChartOption(series, drillDownSeries, parameter) {
  const option = createPieChartOption(series, drillDownSeries, parameter)

  const { mainTitle, innerSize, } = parameter

  option.series[0].innerSize = `${innerSize}%`
  option.drilldown.series.map(s => {
    s.innerSize = `${innerSize}%`
    return s
  })

  if (mainTitle !== '') {
    option.title.align = 'center'
    option.title.verticalAlign = 'middle'
    option.title.y = 40
  }

  return option
}

