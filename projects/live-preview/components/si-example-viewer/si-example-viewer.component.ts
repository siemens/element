/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { setDeviceMode, setDirectionRtl, setRootFontSize } from '../../helpers/utils';
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
import { SiLivePreviewComponent } from '../si-live-preview/si-live-preview.component';

@Component({
  selector: 'si-example-viewer',
  imports: [SiLivePreviewComponent, SiLivePreviewRendererComponent],
  templateUrl: './si-example-viewer.component.html',
  styleUrl: './si-example-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.has-tabs]': 'hasTabs()',
    '[class.has-tabs-mobile]': 'hasTabsMobile()'
  }
})
export class SiExampleViewerComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });

  protected readonly renderer = viewChild.required<SiLivePreviewRendererComponent>('renderer');
  protected readonly ticketBaseUrl = this.config.ticketBaseUrl;
  protected readonly baseUrl = this.config.examplesBaseUrl;
  protected readonly exampleUrl = signal('');
  protected readonly dataId = signal('');
  protected readonly mode = signal('viewer');
  protected readonly theme = signal('light');
  protected readonly locale = signal('');
  protected readonly isRTL = signal(false);
  protected readonly template = signal('');
  protected readonly reactTemplate = signal('');
  protected readonly vueTemplate = signal('');
  protected readonly jsTemplate = signal('');
  protected readonly tabs = signal<{ heading: string; base: string; example: string }[]>([]);
  protected readonly hasTabs = computed(() => this.tabs().length > 1);
  protected readonly hasTabsMobile = computed(
    () => this.tabs().length > 1 && this.internalConfig.isMobile
  );
  protected readonly activeTabIndex = signal(0);

  constructor() {
    this.route.params.subscribe(params => this.mode.set(params.mode ?? 'editor'));
    this.route.queryParams.subscribe(params => this.handleQueryParams(params));
  }

  private handleQueryParams(params: Params): void {
    let handled = false;
    let recompile = false;

    const base = params.base ? params.base + '/' : '';
    if (params.e) {
      const prevUrl = this.exampleUrl();
      this.tabs.set([]);
      this.activeTabIndex.set(0);
      this.exampleUrl.set('');

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
        recompile = prevUrl === this.exampleUrl();
      }

      if (this.tabs().length <= 1 && params.t) {
        if (params.framework === 'react') {
          this.reactTemplate.set(params.t);
        } else if (params.framework === 'vue') {
          this.vueTemplate.set(params.t);
        } else if (params.framework === 'js') {
          this.jsTemplate.set(params.t);
        } else {
          recompile = recompile || this.template() !== params.t;
          this.template.set(params.t);
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
    if (params.mode && this.mode() !== 'editor') {
      setDeviceMode(params.mode);
      recompile = true;
      handled = true;
    }

    if (handled) {
      const { e, t, theme, mode, locale, isRTL, ...newParams } = params;
      this.router.navigate([], { queryParams: newParams });
    }

    if (params.id) {
      recompile = this.dataId() !== params.id;
      this.dataId.set(params.id);
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
    if (this.mode() === 'editor') {
      this.theme.set(theme);
    }

    if (this.themeApi) {
      this.themeApi.setThemeFromPreviewer(theme);
    }
    this.setUiTheme(theme);
  }

  private setRTL(rtl: boolean): void {
    this.isRTL.set(rtl);
    if (this.mode() !== 'editor') {
      setDirectionRtl(rtl);
    }
  }

  private setLocale(locale: string): void {
    if (this.mode() === 'editor') {
      this.locale.set(locale);
      return;
    }

    if (this.localeApi) {
      this.localeApi.setLocale(locale);
    }
  }

  activateTab(index: number): void {
    const example = this.tabs()[index].example;
    this.activeTabIndex.set(index);
    this.exampleUrl.set(this.tabs()[index].base + example);
  }
}
