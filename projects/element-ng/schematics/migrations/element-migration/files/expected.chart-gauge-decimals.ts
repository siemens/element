import { Component } from '@angular/core';
import { SiChartGaugeComponent } from '@siemens/charts-ng/gauge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <si-chart-gauge
      [value]="75"
      [minNumberOfDecimals]="2" [maxNumberOfDecimals]="2"
      [min]="0"
      [max]="100"
    ></si-chart-gauge>

    <si-chart-gauge [minNumberOfDecimals]="0" [maxNumberOfDecimals]="0"></si-chart-gauge>

    <si-chart-gauge
      [value]="gaugeValue"
      [minNumberOfDecimals]="decimals" [maxNumberOfDecimals]="decimals"
    ></si-chart-gauge>
  `,
  imports: [SiChartGaugeComponent]
})
export class DashboardComponent {
  gaugeValue = 85;
  decimals = 1;
}
