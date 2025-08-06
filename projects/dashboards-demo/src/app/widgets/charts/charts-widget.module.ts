/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimplChartsNgModule, themeElement, themeSupport } from '@spike-rabbit/charts-ng';
import { SiResizeObserverModule } from '@spike-rabbit/element-ng/resize-observer';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { CartesianComponent } from './cartesian/cartesian.component';
import { CircleComponent } from './circle/circle.component';
import { GaugeComponent } from './gauge/gauge.component';
import { ValueWidgetComponent } from './value-widget.component';

themeSupport.setDefault(themeElement);
@NgModule({
  imports: [
    CartesianComponent,
    CircleComponent,
    CommonModule,
    GaugeComponent,
    SimplChartsNgModule,
    SiResizeObserverModule,
    SiTranslatePipe,
    ValueWidgetComponent
  ],
  exports: [CartesianComponent, CircleComponent, GaugeComponent, ValueWidgetComponent]
})
export class ChartsWidgetModule {}
