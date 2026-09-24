/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

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
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { SiLivePreviewRendererComponent } from '../si-live-preview-renderer/si-live-preview-renderer.component';
import { SiLivePreviewWebComponentService } from '../si-live-preview-renderer/webcomponent/si-live-webcomponent.service';

const filterTargets = ['_self', '_top', '_parent', ''];

@Component({
  selector: 'si-live-preview-wrapper',
  imports: [SiLivePreviewRendererComponent],
  templateUrl: './si-live-preview-wrapper.component.html',
  styles: 'si-live-preview-renderer { flex: 1;}',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '(click)': 'onClick($event)'
  }
})
export class SiLivePreviewWrapperComponent {
  private readonly renderer = viewChild.required<SiLivePreviewRendererComponent>('renderer');
  private readonly webcomponentRenderer = viewChild.required<ElementRef>('webcomponentRenderer');

  protected readonly state = inject(LivePreviewStateService);
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly ngZone = inject(NgZone);
  private readonly webcomponentService = inject(SiLivePreviewWebComponentService, {
    optional: true
  });
  private readonly cdRef = inject(ChangeDetectorRef);

  private isMobile = false;
  private initialUrl: string;

  constructor() {
    this.themeApi
      ?.getApplicationThemeObservable()
      .pipe(takeUntilDestroyed())
      .subscribe(theme => {
        this.state.theme.set(theme);
        this.sendMessage('theme', theme);
      });
    this.localeApi
      ?.getLocale()
      .pipe(takeUntilDestroyed())
      .subscribe(locale => {
        if (this.state.locale() !== locale) {
          this.state.locale.set(locale);
          this.sendMessage('locale', locale);
        }
      });
    this.initialUrl = window.location.toString();
    this.isMobile = this.internalConfig.isMobile;

    // send ready message only when locale/theme are communicated to avoid loops
    this.sendMessage('ready');

    this.ngZone.runOutsideAngular(() =>
      fromEvent<MessageEvent>(window, 'message')
        .pipe(takeUntilDestroyed())
        .subscribe(message => {
          this.onMessage(message);
          this.cdRef.markForCheck();
        })
    );
  }

  private onMessage(event: MessageEvent): void {
    if (event.data?.src !== 'editor') {
      return;
    }

    this.ngZone.run(() => this.onMessageInZone(event));
  }

  private onMessageInZone(event: MessageEvent): void {
    const modeChanged = this.state.viewport().mode !== event.data.mode;
    this.state.applyRenderRequest(event.data);

    if (this.state.theme() !== event.data.theme) {
      this.setTheme(event.data.theme);
    }

    if (this.state.locale() !== event.data.locale) {
      this.setLocale(event.data.locale);
    }
    if (this.state.rootFontSize() !== event.data.rootFontSize) {
      this.state.rootFontSize.set(event.data.rootFontSize);
      setRootFontSize(event.data.rootFontSize);
    }

    if (this.state.isRTL() !== event.data.isRTL) {
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

    if (modeChanged && this.isMobile) {
      setDeviceMode(event.data.mode);
      this.renderer().recompile();
    }

    const webcomponentRenderer = this.webcomponentRenderer();
    if (
      webcomponentRenderer &&
      (this.state.loadReact() || this.state.loadVue() || this.state.loadJs())
    ) {
      this.webcomponentService?.injectComponent(
        webcomponentRenderer,
        {
          exampleUrl: this.config.examplesBaseUrl + this.state.example(),
          loadReact: this.state.loadReact(),
          loadJs: this.state.loadJs(),
          webcomponentTemplateCode: this.state.activeWebComponentTemplate(),
          loadVue: this.state.loadVue(),
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

  onClick(event: MouseEvent): void {
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
    this.state.theme.set(theme);
    if (this.themeApi) {
      this.themeApi.setThemeFromPreviewer(theme);
    } else {
      document.documentElement.classList.toggle('app--dark', theme === 'dark');
      document.documentElement.classList.toggle('app--light', theme === 'light');
    }
  }

  private setRTL(rtl: boolean): void {
    this.state.isRTL.set(rtl);
    setDirectionRtl(rtl);
  }

  private setLocale(locale: string): void {
    if (!locale) {
      return;
    }

    this.state.locale.set(locale);
    if (this.localeApi) {
      this.localeApi.setLocale(locale);
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
