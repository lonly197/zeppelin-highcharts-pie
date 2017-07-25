import { DonutParameter, createDonutChartOption, } from './donut'

const p = JSON.parse(JSON.stringify(DonutParameter))
export const HalfDonutParameter = p

export function createHalfDonutChartOption(series, drillDownSeries, parameter) {
  const option = createDonutChartOption(series, drillDownSeries, parameter)

  option.plotOptions.pie.startAngle = -90
  option.plotOptions.pie.endAngle = 90
  option.plotOptions.pie.center = [ '50%', '75%', ]

  return option
}

