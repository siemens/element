/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiLanguageSwitcherComponent } from '@siemens/element-ng/language-switcher';

@Component({
  selector: 'app-sample',
  templateUrl: './si-language-switcher.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiLanguageSwitcherComponent]
})
export class SampleComponent {}
