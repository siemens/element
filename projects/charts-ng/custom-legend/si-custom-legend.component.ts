/**
 * Copyright (c) Siemens 2016 - 2025
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
  /** The legend title. */
  readonly title = input<string>();
  /** The legend subtitle. */
  readonly subTitle = input<string>();
  /** The color of the legend title. */
  readonly titleColor = input<string>();
  /** The color of the legend subtitle. */
  readonly subTitleColor = input<string>();
  /** The color of the legend text. */
  readonly textColor = input<string>();
  /** The event emitted when a legend icon is clicked. */
  readonly legendIconClickEvent = output<CustomLegendItem>();
  /** The event emitted when a legend is clicked. */
  readonly legendClickEvent = output<CustomLegendItem>();
  /** The event emitted when the mouse enters a legend. */
  readonly legendHoverStartEvent = output<CustomLegendItem>();
  /** The event emitted when the mouse leaves a legend. */
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
