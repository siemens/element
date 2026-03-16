# Element Native Charts

The Element native chart library for Angular without external dependencies.

## Usage

To use the Element Native Charts Angular components in your project, add them to your dependencies
by executing:

```sh
npm install --save @siemens/native-charts-ng
```

Element Native Charts uses standalone components with separate entry points.
Import components directly from their specific entry points:

```ts
import { SiNChartGaugeComponent } from '@siemens/native-charts-ng/gauge';
import { SiMicrochartBarComponent } from '@siemens/native-charts-ng/microchart-bar';
import { SiMicrochartDonutComponent } from '@siemens/native-charts-ng/microchart-donut';
import { SiMicrochartLineComponent } from '@siemens/native-charts-ng/microchart-line';
import { SiMicrochartProgressComponent } from '@siemens/native-charts-ng/microchart-progress';

@Component({
  selector: 'app-dashboard',
  imports: [
    SiNChartGaugeComponent,
    SiMicrochartBarComponent
    // ... other components
  ],
  template: `
    <si-nchart-gauge [series]="gaugeSeries" [min]="0" [max]="100" />
    <si-microchart-bar [series]="barSeries" />
  `
})
export class DashboardComponent {}
```

### Running unit tests

Run `npm run native-charts:test` to perform the unit tests via [Karma](https://karma-runner.github.io).
You can set a seed for running the tests in a specific using an environment variable: `SEED=71384 npm run native-charts:test`

## License

Code and documentation Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
