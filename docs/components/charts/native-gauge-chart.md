# Native gauge chart

**Native gauge charts** are lightweight data visualization elements that represent one or more values as a position on a radial arc scale. Unlike the [ECharts-based gauge chart](gauge-chart.md), they require no third-party charting library, making them ideal for performance-sensitive or bundle-size-constrained applications.

## Usage ---

T.B.D

## Design ---

T.B.D

## Code ---

### Usage

```ts
import { SiNChartGaugeComponent } from '@siemens/native-charts-ng/gauge';

@Component({
  imports: [SiNChartGaugeComponent, ...]
})
```

### Sum mode

Multiple series arcs are stacked on the gauge ring. The center shows their combined total.

<si-docs-component example="si-ncharts/si-nchart-gauge" height="400"></si-docs-component>

### Single mode

A single arc covers the ring. Colored background segments can be layered beneath the arc to indicate qualitative ranges.

<si-docs-component example="si-ncharts/si-nchart-gauge-single" height="400"></si-docs-component>

<si-docs-api component="SiNChartGaugeComponent" package="@siemens/native-charts-ng" hideImplicitlyPublic="true"></si-docs-api>

<si-docs-types></si-docs-types>
