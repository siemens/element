import { Component } from '@angular/core';
import { SiChartGaugeComponent } from '@siemens/charts-ng/gauge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <si-chart-gauge
      [value]="75"
      [numberOfDecimals]="2"
      [min]="0"
      [max]="100"
    ></si-chart-gauge>

    <si-chart-gauge [numberOfDecimals]="0"></si-chart-gauge>

    <si-chart-gauge
      [value]="gaugeValue"
      [numberOfDecimals]="decimals"
    ></si-chart-gauge>
  `,
  imports: [SiChartGaugeComponent]
})
export class DashboardComponent {
  gaugeValue = 85;
  decimals = 1;
}
