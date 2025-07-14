/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, HostBinding, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { setDeviceMode, setDirectionRtl } from '../../helpers/utils';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import {
  SiLivePreviewLocaleApi,
  SiLivePreviewThemeApi,
  ThemeType
} from '../../interfaces/si-live-preview.api';
import { SiLivePreviewRendererComponent } from '../si-live-preview-renderer/si-live-preview-renderer.component';

@Component({
  selector: 'si-example-viewer',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './si-example-viewer.component.html',
  styleUrl: './si-example-viewer.component.scss'
})
export class SiExampleViewerComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private config = inject(SI_LIVE_PREVIEW_CONFIG);
  private internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private localeApi = inject(SiLivePreviewLocaleApi, { optional: true });

  readonly renderer = viewChild.required<SiLivePreviewRendererComponent>('renderer');

  @HostBinding('class.has-tabs') get hasTabs(): boolean {
    return this.tabs.length > 1;
  }
  @HostBinding('class.has-tabs-mobile') get hasTabsMobile(): boolean {
    return this.tabs.length > 1 && this.internalConfig.isMobile;
  }

  ticketBaseUrl = this.config.ticketBaseUrl;
  baseUrl = this.config.examplesBaseUrl;
  exampleUrl!: string;
  dataId = '';
  mode = 'viewer';
  theme = 'light';
  locale?: string;
  isRTL = false;
  template = '';
  reactTemplate = '';
  vueTemplate = '';
  jsTemplate = '';

  tabs: { heading: string; base: string; example: string }[] = [];
  activeTabIndex = 0;

  constructor() {
    this.route.params.subscribe(params => (this.mode = params.mode ?? 'editor'));
    this.route.queryParams.subscribe(params => this.handleQueryParams(params));
  }

  private handleQueryParams(params: Params): void {
    let handled = false;
    let recompile = false;

    const base = params.base ? params.base + '/' : '';
    if (params.e) {
      const prevUrl = this.exampleUrl;
      this.tabs = [];
      this.activeTabIndex = 0;
      this.exampleUrl = '';

      const examples = Array.isArray(params.e) ? params.e : [params.e];
      examples.forEach(element => {
        const parts = element.split(';');
        this.tabs.push({
          heading: parts[1],
          base,
          example: parts[0]
        });
      });

      if (this.tabs.length) {
        this.activateTab(0);
        recompile = prevUrl === this.exampleUrl;
      }

      if (this.tabs.length <= 1 && params.t) {
        if (params.framework === 'react') {
          this.reactTemplate = params.t;
        } else if (params.framework === 'vue') {
          this.vueTemplate = params.t;
        } else if (params.framework === 'js') {
          this.jsTemplate = params.t;
        } else {
          recompile = recompile || this.template !== params.t;
          this.template = params.t;
        }
      }

      handled = true;
    }

    if (params.theme) {
      this.setTheme(params.theme);
      handled = true;
    }
    if (params.locale) {
      this.setLocale(params.locale);
      handled = true;
    }
    if (params.isRTL) {
      this.setRTL(params.isRTL);
      handled = true;
    }
    if (params.mode && this.mode !== 'editor') {
      setDeviceMode(params.mode);
      recompile = true;
      handled = true;
    }

    if (handled) {
      const { e, t, theme, mode, locale, isRTL, ...newParams } = params;
      this.router.navigate([], { queryParams: newParams });
    }

    if (params.id) {
      recompile = this.dataId !== params.id;
      this.dataId = params.id;
    }

    if (recompile) {
      this.renderer()?.recompile();
    }
  }

  private setUiTheme(theme: ThemeType): void {
    document.documentElement.classList.toggle('app--dark', theme === 'dark');
    document.documentElement.classList.toggle('app--light', theme === 'light');
  }

  private setTheme(theme: ThemeType): void {
    if (this.mode === 'editor') {
      this.theme = theme;
    }

    if (this.themeApi) {
      this.themeApi.setThemeFromPreviewer(theme);
    }
    this.setUiTheme(theme);
  }

  private setRTL(rtl: boolean): void {
    this.isRTL = rtl;
    if (this.mode !== 'editor') {
      setDirectionRtl(rtl);
    }
  }

  private setLocale(locale: string): void {
    if (this.mode === 'editor') {
      this.locale = locale;
      return;
    }

    if (this.localeApi) {
      this.localeApi.setLocale(locale);
    }
  }

  activateTab(index: number): void {
    const example = this.tabs[index].example;
    this.activeTabIndex = index;
    this.exampleUrl = this.tabs[index].base + example;
  }
}
