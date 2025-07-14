/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Observable } from 'rxjs';

export type ThemeType = 'dark' | 'light';

export abstract class SiLivePreviewThemeApi {
  abstract setThemeFromPreviewer(mode: ThemeType): void;
  abstract getApplicationThemeObservable(): Observable<ThemeType>;
}

export abstract class SiLivePreviewLocaleApi {
  abstract setLocale(locale: string): void;
  abstract getLocale(): Observable<string>;
  abstract availableLocales(): string[];
}
