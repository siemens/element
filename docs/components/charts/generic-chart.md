# Generic chart

A generic chart with full support for [ECharts options](https://echarts.apache.org/en/option.html#title).

## Tooltip content

The built-in tooltip formatters display category labels, series names and values as
plain text, not HTML. For example, `<b>Temperature</b>` is displayed literally.
Pass raw strings rather than pre-escaped strings: `&amp;` is displayed as `&amp;`,
not `&`. Null and undefined values are displayed as empty text.

Custom tooltip formatters, including the cartesian chart's `tooltipFormatter` input
and `options.tooltip.formatter`, are responsible for escaping untrusted values
with `echarts.format.encodeHTML` before inserting them into HTML. Import `echarts`
from `@siemens/charts-ng/common` to use this function.

## Code ---

### Usage

??? info "Required Packages"

    - [echarts](https://www.npmjs.com/package/echarts)

```ts
import { SiChartComponent } from '@siemens/charts-ng/chart';

@Component({
  imports: [SiChartComponent, ...]
})
```

<si-docs-component example="si-charts/generic/si-chart-generic" full="true" height="400"></si-docs-component>

<si-docs-api component="SiChartComponent" package="@siemens/charts-ng" hideImplicitlyPublic="true"></si-docs-api>

<si-docs-types></si-docs-types>
