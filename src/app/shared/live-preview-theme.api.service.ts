/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { SiThemeService } from '@siemens/element-ng/theme';
import { SiLivePreviewThemeApi, ThemeType } from '@siemens/live-preview';
import { Observable } from 'rxjs';

@Injectable()
export class LivePreviewThemeApiService extends SiLivePreviewThemeApi {
  private themeSwitcher = inject(SiThemeService);

  setThemeFromPreviewer(theme: ThemeType): void {
    this.themeSwitcher.applyThemeType(theme);
  }

  getApplicationThemeObservable(): Observable<ThemeType> {
    return this.themeSwitcher.resolvedColorScheme$;
  }
}
