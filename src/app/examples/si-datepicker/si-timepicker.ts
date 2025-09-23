/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTimepickerComponent } from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiTimepickerComponent, FormsModule, SiFormItemComponent],
  templateUrl: './si-timepicker.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly min = signal<Date | undefined>(new Date('2022-01-10T06:00:00.000Z'));
  readonly max = signal<Date | undefined>(new Date('2022-01-10T09:00:00.000Z'));

  mytime = new Date('2022-01-12T05:00:00.000Z');
  showSeconds = true;
  showMilliseconds = true;
  showMeridian = true;
  hideLabels = false;
  readonly = false;
  disabled = false;

  update(input: WritableSignal<Date | undefined>, time: string): void {
    if (time) {
      const parts = time.split(':').map(v => parseInt(v, 10));
      input.set(new Date(2022, 0, 10, parts.at(0)!, parts.at(1)!, parts.at(2) ?? 0));
    } else {
      input.set(undefined);
    }
  }

  toTime(time: Date | undefined, previous: string): string {
    if (!time) {
      return previous;
    }
    const v = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    return v;
  }

  stringify(value: any): string {
    return JSON.stringify(value);
  }
}
