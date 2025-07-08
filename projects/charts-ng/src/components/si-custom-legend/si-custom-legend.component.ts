/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, input, output, viewChild } from '@angular/core';

import { CustomLegend, CustomLegendItem } from './si-custom-legend.interface';

@Component({
  selector: 'si-custom-legend',
  templateUrl: './si-custom-legend.component.html',
  styleUrl: './si-custom-legend.component.scss'
})
export class SiCustomLegendComponent {
  /** @internal */
  readonly customLegendContainer = viewChild.required<ElementRef>('customLegendContainer');

  readonly customLegend = input<CustomLegend>();
  readonly title = input<string>();
  readonly subTitle = input<string>();

  readonly titleColor = input<string>();
  readonly subTitleColor = input<string>();
  readonly textColor = input<string>();

  readonly legendIconClickEvent = output<CustomLegendItem>();
  readonly legendClickEvent = output<CustomLegendItem>();

  readonly legendHoverStartEvent = output<CustomLegendItem>();
  readonly legendHoverEndEvent = output<CustomLegendItem>();

  protected legendIconClick(legend: CustomLegendItem): void {
    legend.selected = !legend.selected;
    this.legendIconClickEvent.emit(legend);
  }

  protected legendClick(legend: CustomLegendItem): void {
    legend.selected = !legend.selected;
    this.legendClickEvent.emit(legend);
  }
}
