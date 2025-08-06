/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@spike-rabbit/element-ng/common';
import { SiNavbarModule } from '@spike-rabbit/element-ng/navbar';
import { SiThemeService, ThemeType } from '@spike-rabbit/element-ng/theme';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule, JsonPipe],
  templateUrl: './si-navbar-primary-select-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private readonly availableLanguages = ['en', 'de', 'fr'];
  private languageItems: MenuItem[] = this.availableLanguages.map(language => ({
    id: language,
    title: `LANGUAGE.${language.toUpperCase()}`,
    action: () => this.switchLanguage(language)
  }));

  private themeItems: MenuItem[] = [
    {
      id: 'auto',
      title: 'THEME_EDITOR.COLOR_SCHEMES.AUTO',
      action: () => this.switchTheme('auto')
    },
    {
      id: 'light',
      title: 'THEME_EDITOR.COLOR_SCHEMES.LIGHT',
      action: () => this.switchTheme('light')
    },
    { id: 'dark', title: 'THEME_EDITOR.COLOR_SCHEMES.DARK', action: () => this.switchTheme('dark') }
  ];

  private translate = inject(TranslateService);
  private themeService = inject(SiThemeService);
  private currentTheme = this.themeService.resolvedColorScheme;
  private currentLanguage = (this.translate.currentLang || this.translate.getBrowserLang()) ?? 'en';

  accountItems: MenuItem[] = [
    { title: 'APP.NAV.LANGUAGE', icon: 'element-language', items: this.languageItems },
    { title: 'APP.NAV.THEME', icon: 'element-palette', items: this.themeItems },
    { title: 'APP.NAV.PROFILE', icon: 'element-user', link: 'profile' }
  ];

  themeToggleQuickAction = {
    title: 'APP.NAV.THEME',
    icon: 'element-sun',
    action: () => this.toggleTheme()
  };

  primaryItems = [];

  constructor() {
    this.switchLanguage(this.currentLanguage);
    this.switchTheme(this.currentTheme ?? 'auto');
    this.themeService.resolvedColorScheme$.pipe(takeUntilDestroyed()).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  private switchLanguage(language: string): void {
    this.translate.use(language);
    this.languageItems = this.languageItems.map(item => ({
      ...item,
      isActive: item.id === language
    }));
  }

  private switchTheme(theme: ThemeType): void {
    this.themeService.applyThemeType(theme);
    this.themeItems = this.themeItems.map(item => ({ ...item, isActive: item.id === theme }));
    this.themeToggleQuickAction.icon =
      this.themeService.resolvedColorScheme === 'dark' ? 'element-sun' : 'element-economy';
  }

  private toggleTheme(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.themeService.resolvedColorScheme === 'light'
      ? this.switchTheme('dark')
      : this.switchTheme('light');
  }
}
