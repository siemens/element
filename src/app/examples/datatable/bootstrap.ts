/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  elementAlarm,
  elementAlarmBackgroundFilled,
  elementAlarmFilled,
  elementAlarmTick,
  elementCalculatedValue,
  elementCancelFilled,
  elementConfigValue,
  elementDown2,
  elementMaintenanceFilled,
  elementManualFilled,
  elementTransient,
  elementPhysicalInput
} from '@siemens/element-icons';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiIconComponent],
  templateUrl: './bootstrap.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly icons = addIcons({
    elementAlarm,
    elementAlarmBackgroundFilled,
    elementAlarmFilled,
    elementAlarmTick,
    elementCalculatedValue,
    elementCancelFilled,
    elementConfigValue,
    elementDown2,
    elementMaintenanceFilled,
    elementManualFilled,
    elementTransient,
    elementPhysicalInput
  });
  useHover = false;
  useSmallTable = false;
}
