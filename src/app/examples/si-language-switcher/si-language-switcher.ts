/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiLanguageSwitcherComponent } from '@siemens/element-ng/language-switcher';

@Component({
  selector: 'app-sample',
  imports: [SiLanguageSwitcherComponent],
  templateUrl: './si-language-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
