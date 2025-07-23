/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiThemeService, ThemeType } from '@siemens/element-ng/theme';

@Component({
  selector: 'app-sample',
  imports: [FormsModule],
  templateUrl: './theme-switcher.html'
})
export class SampleComponent {
  theme: ThemeType = 'light';

  private themeService = inject(SiThemeService);

  applyThemeType(): void {
    this.themeService.applyThemeType(this.theme);
  }
}
