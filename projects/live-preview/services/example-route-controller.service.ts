/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { setDeviceMode, setDirectionRtl, setRootFontSize } from '../helpers/utils';
import { SI_LIVE_PREVIEW_INTERNALS } from '../interfaces/live-preview-config';
import {
  SiLivePreviewLocaleApi,
  SiLivePreviewThemeApi,
  ThemeType
} from '../interfaces/si-live-preview.api';
import { LivePreviewStateService } from './live-preview-state.service';

export interface ExampleTab {
  heading: string;
  base: string;
  example: string;
}

/** Shared URL handling, provided separately by each editor/viewer route component. */
@Service()
export class ExampleRouteController {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  private readonly state = inject(LivePreviewStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs = signal<ExampleTab[]>([]);
  readonly hasTabs = computed(() => this.tabs().length > 1);
  readonly hasTabsMobile = computed(() => this.tabs().length > 1 && this.internalConfig.isMobile);
  readonly activeTabIndex = signal(0);

  private context: 'editor' | 'viewer' = 'viewer';

  initialize(context: 'editor' | 'viewer', recompile?: () => void): void {
    this.context = context;
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (this.handleQueryParams(params)) {
        recompile?.();
      }
    });
  }

  private handleQueryParams(params: Params): boolean {
    let handled = false;
    let recompile = false;

    const base = params.base ? params.base + '/' : '';
    if (params.e) {
      const prevUrl = this.state.example();
      const previousTemplate = this.state.template();
      this.tabs.set([]);
      this.activeTabIndex.set(0);
      this.state.example.set('');
      this.state.clearTemplates();

      const examples = Array.isArray(params.e) ? params.e : [params.e];
      examples.forEach(element => {
        const parts = element.split(';');
        this.tabs.update(t => [
          ...t,
          {
            heading: parts[1],
            base,
            example: parts[0]
          }
        ]);
      });

      if (this.tabs().length) {
        this.activateTab(0);
        recompile = prevUrl === this.state.example();
      }

      if (this.tabs().length <= 1 && params.t) {
        if (params.framework === 'react') {
          this.state.templateReact.set(params.t);
        } else if (params.framework === 'vue') {
          this.state.templateVue.set(params.t);
        } else if (params.framework === 'js') {
          this.state.templateJs.set(params.t);
        } else {
          recompile = recompile || previousTemplate !== params.t;
          this.state.template.set(params.t);
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
    if (params.rfs) {
      setRootFontSize(parseInt(params.rfs, 10));
    }
    if (params.isRTL) {
      this.setRTL(params.isRTL);
      handled = true;
    }
    if (params.mode && this.context !== 'editor') {
      setDeviceMode(params.mode);
      recompile = true;
      handled = true;
    }

    if (handled) {
      const { e, t, theme, mode, locale, isRTL, ...newParams } = params;
      this.router.navigate([], { queryParams: newParams });
    }

    if (params.id) {
      recompile = this.state.dataId() !== params.id;
      this.state.dataId.set(params.id);
    }

    return recompile;
  }

  private setUiTheme(theme: ThemeType): void {
    document.documentElement.classList.toggle('app--dark', theme === 'dark');
    document.documentElement.classList.toggle('app--light', theme === 'light');
  }

  private setTheme(theme: ThemeType): void {
    if (this.context === 'editor') {
      this.state.theme.set(theme);
    }

    if (this.themeApi) {
      this.themeApi.setThemeFromPreviewer(theme);
    }
    this.setUiTheme(theme);
  }

  private setRTL(rtl: boolean): void {
    this.state.isRTL.set(rtl);
    if (this.context !== 'editor') {
      setDirectionRtl(rtl);
    }
  }

  private setLocale(locale: string): void {
    if (this.context === 'editor') {
      this.state.locale.set(locale);
      return;
    }

    if (this.localeApi) {
      this.localeApi.setLocale(locale);
    }
  }

  activateTab(index: number): void {
    const example = this.tabs()[index].example;
    this.activeTabIndex.set(index);
    this.state.example.set(this.tabs()[index].base + example);
  }
}
