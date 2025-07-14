/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

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
import { SiLivePreviewWebComponentService } from '../si-live-preview-renderer/webcomponent/si-live-webcomponent.service';

const filterTargets = ['_self', '_top', '_parent', ''];

@Component({
  selector: 'si-live-preview-wrapper',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './si-live-preview-wrapper.component.html',
  styles: 'si-live-preview-renderer { flex: 1;}'
})
export class SiLivePreviewWrapperComponent {
  readonly renderer = viewChild.required<SiLivePreviewRendererComponent>('renderer');
  readonly webcomponentRenderer = viewChild.required<ElementRef>('webcomponentRenderer');

  exampleUrl!: string;
  template = '';
  loadReact = false;
  loadVue = false;
  loadJs = false;
  webcomponentTemplateCode = '';
  private isMobile = false;
  private theme!: ThemeType;
  private isRTL = false;
  private mode!: string;
  private locale?: string;
  private initialUrl: string;

  private config = inject(SI_LIVE_PREVIEW_CONFIG);
  private themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  private internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private webcomponentService = inject(SiLivePreviewWebComponentService, { optional: true });

  constructor() {
    this.sendMessage('ready');

    this.themeApi
      ?.getApplicationThemeObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(theme => {
        this.theme = theme;
        this.sendMessage('theme', this.theme);
      });
    this.localeApi
      ?.getLocale()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(locale => {
        if (this.locale !== locale) {
          this.locale = locale;
          this.sendMessage('locale', this.locale);
        }
      });
    this.initialUrl = window.location.toString();
    this.isMobile = this.internalConfig.isMobile;

    this.ngZone.runOutsideAngular(() =>
      fromEvent<MessageEvent>(window, 'message')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(message => this.onMessage(message))
    );
  }

  private onMessage(event: MessageEvent): void {
    if (!event.data || event.data.src !== 'editor') {
      return;
    }

    this.ngZone.run(() => this.onMessageInZone(event));
  }

  private onMessageInZone(event: MessageEvent): void {
    this.exampleUrl = event.data.exampleUrl;
    this.template = event.data.template;
    this.loadReact = event.data.loadReact;
    this.loadVue = event.data.loadVue;
    this.loadJs = event.data.loadJs;
    this.webcomponentTemplateCode = event.data.reactVueTemplate;

    if (this.theme !== event.data.theme) {
      this.setTheme(event.data.theme);
    }

    if (this.locale !== event.data.locale) {
      this.setLocale(event.data.locale);
    }

    if (this.isRTL !== event.data.isRTL) {
      this.setRTL(event.data.isRTL);
    }

    if (this.isMobile) {
      this.setSafeArea(
        event.data.safeAreaTop,
        event.data.safeAreaBottom,
        event.data.safeAreaLeft,
        event.data.safeAreaRight
      );
    }

    if (this.mode !== event.data.mode && this.isMobile) {
      this.mode = event.data.mode;
      setDeviceMode(this.mode);
      this.renderer().recompile();
    }

    const webcomponentRenderer = this.webcomponentRenderer();
    if (webcomponentRenderer && (this.loadReact || this.loadVue || this.loadJs)) {
      this.webcomponentService?.injectComponent(
        webcomponentRenderer,
        {
          exampleUrl: this.exampleUrl,
          loadReact: this.loadReact,
          loadJs: this.loadJs,
          webcomponentTemplateCode: this.webcomponentTemplateCode,
          loadVue: this.loadVue,
          config: this.config
        },
        {
          inProgress: this.sendMessage
        }
      );
    } else {
      this.webcomponentService?.destroyComponent();
    }
  }

  @HostListener('click', ['$event']) onClick(event: MouseEvent): void {
    const target = event?.target as HTMLElement;
    if (target?.tagName === 'A' && !event.defaultPrevented) {
      // for normal link: ok if it starts with the proper route, else open in a new window
      const newUrl = (target as HTMLAnchorElement).href;
      const linkTarget = (target as HTMLAnchorElement).target;
      if (newUrl && !newUrl.startsWith(this.initialUrl) && filterTargets.includes(linkTarget)) {
        event.preventDefault();
        window.open(newUrl, '_blank');
      }
    }
  }

  sendMessage(type: string, message?: any): void {
    window.parent.postMessage({ src: 'renderer', type, message }, '*');
  }

  private setTheme(theme: ThemeType): void {
    this.theme = theme;
    if (this.themeApi) {
      this.themeApi.setThemeFromPreviewer(this.theme);
    } else {
      document.documentElement.classList.toggle('app--dark', this.theme === 'dark');
      document.documentElement.classList.toggle('app--light', this.theme === 'light');
    }
  }

  private setRTL(rtl: boolean): void {
    this.isRTL = rtl;
    setDirectionRtl(rtl);
  }

  private setLocale(locale: string): void {
    if (!locale) {
      return;
    }

    this.locale = locale;
    if (this.localeApi) {
      this.localeApi.setLocale(this.locale);
    }
  }

  private setSafeArea(
    top: number | undefined,
    bottom: number | undefined,
    left: number | undefined,
    right: number | undefined
  ): void {
    const htmlTag = document.documentElement;
    htmlTag.style.setProperty('--ion-safe-area-top', (top ?? 0) + 'px');
    htmlTag.style.setProperty('--ion-safe-area-bottom', (bottom ?? 0) + 'px');
    htmlTag.style.setProperty('--ion-safe-area-left', (left ?? 0) + 'px');
    htmlTag.style.setProperty('--ion-safe-area-right', (right ?? 0) + 'px');
  }
}
