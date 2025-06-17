/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import {
  elementCircleFilled,
  elementOutOfService,
  elementNotChecked,
  elementStateExclamationMark,
  elementStateTick,
  addIcons,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { ResultDetailStep } from './si-result-details-list.datamodel';

@Component({
  selector: 'si-result-details-list',
  templateUrl: './si-result-details-list.component.html',
  styleUrl: './si-result-details-list.component.scss',
  imports: [SiLoadingSpinnerComponent, SiIconNextComponent, SiTranslateModule]
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
