/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import {
  addIcons,
  elementCircleFilled,
  elementNotChecked,
  elementOutOfService,
  elementStateExclamationMark,
  elementStateTick,
  SiIconNextComponent
} from '@spike-rabbit/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@spike-rabbit/element-ng/loading-spinner';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { ResultDetailStep } from './si-result-details-list.datamodel';

@Component({
  selector: 'si-result-details-list',
  imports: [SiLoadingSpinnerComponent, SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-result-details-list.component.html',
  styleUrl: './si-result-details-list.component.scss'
})
export class SiResultDetailsListComponent {
  /**
   * Array of steps to show in the list.
   *
   * @defaultValue []
   */
  readonly steps = input<ResultDetailStep[]>([]);

  protected readonly stepHasValue = computed(() => this.steps().some(item => !!item.value));

  protected readonly icons = addIcons({
    elementCircleFilled,
    elementNotChecked,
    elementOutOfService,
    elementStateExclamationMark,
    elementStateTick
  });
}
