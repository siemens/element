/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SiDatepickerDirective } from '@siemens/element-ng/datepicker';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiLanguageSwitcherComponent } from '@siemens/element-ng/language-switcher';

export const DATE_PATTERN = 'date-pattern';
export const DATE_PATTERN_ENABLE = 'date-pattern.enable';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiLanguageSwitcherComponent,
    TranslateModule,
    SiDatepickerDirective,
    SiFormModule,
    FormsModule
  ],
  templateUrl: './si-localization.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  date = new Date();
  currency = 123.2356;
  num = -2.1234;
  percent = 0.4543;
  json = JSON.parse('{ "name": "element" }');
  datePattern!: string;
  enableDatePattern!: boolean;

  constructor() {
    this.load();
  }

  toggleEnableCustomFormat(): void {
    this.enableDatePattern = !this.enableDatePattern;
    this.save();
  }

  applyDateFormat(): void {
    this.enableDatePattern = true;
    this.save();
  }

  load(): void {
    this.datePattern = localStorage.getItem(DATE_PATTERN) ?? '';
    this.enableDatePattern = localStorage.getItem(DATE_PATTERN_ENABLE) === 'true';
  }

  save(): void {
    localStorage.setItem(DATE_PATTERN, this.datePattern.trim());
    localStorage.setItem(DATE_PATTERN_ENABLE, '' + this.enableDatePattern);
    window.location.reload();
  }
}
