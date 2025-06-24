/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';

import { SiWidgetBaseComponent } from '../si-widget-base.component';
import {
  SiTimelineWidgetItem,
  SiTimelineWidgetItemComponent
} from './si-timeline-widget-item.component';

@Component({
  selector: 'si-timeline-widget-body',
  imports: [SiTimelineWidgetItemComponent],
  templateUrl: './si-timeline-widget-body.component.html',
  styleUrl: './si-timeline-widget-body.component.scss'
})
export class SiTimelineWidgetBodyComponent extends SiWidgetBaseComponent<SiTimelineWidgetItem[]> {
  /**
   * Number of skeleton progress indication items.
   *
   * @defaultValue 4
   */
  readonly numberOfItems = input(4);

  /**
   * Whether to show or hide the description row during skeleton progress indication.
   *
   * @defaultValue `true`
   */
  readonly showDescription = input(true);

  /** Used to display the defined number of ghost items */
  protected readonly ghosts = computed(() => {
    return new Array(this.numberOfItems() ?? 4);
  });
}
