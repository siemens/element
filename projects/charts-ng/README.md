# Element Charts

The Element chart library for Angular based on ECharts. Going through the roof. Stoinks.

## Usage

To use the Element Charts Angular components in your project, add them to your dependencies
by executing:

```sh
npm install --save @siemens/charts-ng
```

You also have to install the peer dependencies of Element Charts.

```sh
npm install echarts --save
```

Import the library to your Angular `AppModule`, mostly residing in your
`src/app/app.modules.ts` file as follows:

```ts
// [...]

// Import this library
import { SiChartsNgModule } from '@siemens/charts-ng';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, SiChartsNgModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Starting with v49, Element Charts uses separate entry points for each component.
Import components directly from their specific entry points:

```ts
import { SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { SiChartCircleComponent } from '@siemens/charts-ng/circle';
import { SiChartGaugeComponent } from '@siemens/charts-ng/gauge';
// ... and other components

@Component({
  imports: [SiChartCartesianComponent, ...]
})
export class AppComponent {}
```

### Running unit tests

Run `npm run charts:test` to perform the unit tests via [Vitest](https://main.vitest.dev/).

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
