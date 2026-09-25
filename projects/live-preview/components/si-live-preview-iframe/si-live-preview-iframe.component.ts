/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  NgZone,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
import { SiLivePreviewQrComponent } from '../si-live-preview-qr/si-live-preview-qr.component';
import { SiLivePreviewRendererComponent } from '../si-live-preview-renderer/si-live-preview-renderer.component';
import { SiLivePreviewWebComponentService } from '../si-live-preview-renderer/webcomponent/si-live-webcomponent.service';
import { availableDevices, Device } from './devices';

@Component({
  selector: 'si-live-preview-iframe',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    SiLivePreviewQrComponent,
    SiLivePreviewRendererComponent
  ],
  templateUrl: './si-live-preview-iframe.component.html',
  styleUrl: './si-live-preview-iframe.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.is-mobile]': 'isMobile',
    '(click)': 'onPreviewClick($event)'
  }
})
export class SiLivePreviewIframeComponent implements OnInit {
  readonly previewIframe = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');
  private readonly renderer = viewChild<SiLivePreviewRendererComponent>('renderer');
  private readonly webcomponentRenderer = viewChild<ElementRef>('webcomponentRenderer');

  readonly baseUrl = input.required<string>();
  readonly exampleUrl = input.required<string>();
  readonly template = input.required<string>();
  readonly ticketLinkBug = input.required<string>();
  readonly ticketLinkFeature = input.required<string>();
  readonly isFullscreen = input(false);
  readonly iFrameHeight = input<string>();
  readonly iFrameWidth = input<string>();
  readonly theme = model('light');
  readonly locale = model<string | null | undefined>();
  readonly rootFontSize = input<number | 'initial'>(0);
  readonly isRTL = input<boolean>();
  readonly loadReact = input<boolean>();
  readonly loadVue = input<boolean>();
  readonly loadJs = input<boolean>();
  readonly reactVueTemplate = input<string>();

  readonly templateFromComponent = output<string | undefined>();
  readonly logClear = output<void>();
  readonly logMessage = output<string>();
  readonly logRenderingError = output<any>();
  readonly inProgress = output<boolean>();

  private originalTemplate = '';
  private templateModified = false;
  private previousMode?: string;
  private rendererInProgress = false;
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly themeApi = inject(SiLivePreviewThemeApi, { optional: true });
  private readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  private readonly webcomponentService = inject(SiLivePreviewWebComponentService, {
    optional: true
  });

  protected readonly isMobile = this.internalConfig.isMobile;
  protected readonly directlyEmbedExamples = this.config.directlyEmbedExamples ?? false;

  /** iframe height, seeded from the {@link iFrameHeight} input and mutable in mobile mode. */
  protected readonly currentIFrameHeight = linkedSignal(() => this.iFrameHeight());
  /** iframe width, seeded from the {@link iFrameWidth} input and mutable in mobile mode. */
  protected readonly currentIFrameWidth = linkedSignal(() => this.iFrameWidth());

  protected readonly mode = signal('ios');
  protected readonly landscape = signal(false);

  protected readonly switcherEnabled = this.config.themeSwitcher;

  protected readonly landscapeEnabled = this.config.landscapeToggle;
  protected readonly supportsLandscape = signal(false);

  protected readonly availableDevices = availableDevices;
  protected readonly selectedDevice = signal<Device | undefined>(undefined);
  protected readonly showNotch = signal(false);
  protected readonly showQrMenu = signal(false);
  protected readonly plainUrl = signal('');
  protected readonly plainUrlShort = signal('');

  constructor() {
    if (this.directlyEmbedExamples) {
      this.destroyRef.onDestroy(() => this.webcomponentService?.destroyComponent());
      this.themeApi
        ?.getApplicationThemeObservable()
        .pipe(takeUntilDestroyed())
        .subscribe(theme => {
          if (this.theme() !== theme) {
            this.theme.set(theme);
          }
        });
      this.localeApi
        ?.getLocale()
        .pipe(takeUntilDestroyed())
        .subscribe(locale => {
          if (this.locale() !== locale) {
            this.locale.set(locale);
          }
        });
    }
    effect(() => {
      this.templateModified = this.originalTemplate !== this.template();
      if (!this.directlyEmbedExamples && this.previewIframe()) {
        this.sendMessage();
      }
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      const theme = this.theme() as ThemeType;
      if (this.themeApi) {
        this.themeApi.setThemeFromPreviewer(theme);
      } else {
        document.documentElement.classList.toggle('app--dark', theme === 'dark');
        document.documentElement.classList.toggle('app--light', theme === 'light');
      }
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      const locale = this.locale();
      if (locale) {
        this.localeApi?.setLocale(locale);
      }
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      setRootFontSize(this.rootFontSize());
      setDirectionRtl(!!this.isRTL());
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      const mode = this.mode();
      if (this.isMobile) {
        setDeviceMode(mode);
        if (this.previousMode && this.previousMode !== mode) {
          this.renderer()?.recompile();
        }
        this.previousMode = mode;
      }
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      const landscape = this.landscape();
      const device = this.selectedDevice();
      if (this.isMobile) {
        const area = landscape ? device?.safeAreaLandscape : device?.safeAreaPortrait;
        const html = document.documentElement;
        html.style.setProperty('--ion-safe-area-top', `${area?.top ?? 0}px`);
        html.style.setProperty('--ion-safe-area-bottom', `${area?.bottom ?? 0}px`);
        html.style.setProperty('--ion-safe-area-left', `${area?.left ?? 0}px`);
        html.style.setProperty('--ion-safe-area-right', `${area?.right ?? 0}px`);
      }
    });
    effect(() => {
      if (!this.directlyEmbedExamples) {
        return;
      }
      const element = this.webcomponentRenderer();
      const loadReact = this.loadReact();
      const loadVue = this.loadVue();
      const loadJs = this.loadJs();
      const exampleUrl = this.baseUrl() + this.exampleUrl();
      const webcomponentTemplateCode = this.reactVueTemplate();
      if (element && (loadReact || loadVue || loadJs)) {
        this.webcomponentService?.injectComponent(
          element,
          { exampleUrl, loadReact, loadVue, loadJs, webcomponentTemplateCode, config: this.config },
          { inProgress: (_type: string, value: boolean) => this.onRendererProgress(value) }
        );
      } else {
        this.webcomponentService?.destroyComponent();
      }
    });
  }

  ngOnInit(): void {
    if (!this.directlyEmbedExamples) {
      this.ngZone.runOutsideAngular(() =>
        fromEvent<MessageEvent>(window, 'message')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(message => {
            this.onMessage(message);
            this.cdRef.markForCheck();
          })
      );
    }
    if (this.isMobile) {
      const deviceId = localStorage.getItem('si-live-preview-selected-device');
      this.selectedDevice.set(
        this.availableDevices.find(dev => dev.id === deviceId) ?? this.availableDevices[0]
      );
      this.deviceChanged();
    }
  }

  deviceChanged(): void {
    let selectedDevice = this.selectedDevice();
    if (!selectedDevice) {
      selectedDevice = this.availableDevices[0];
      this.selectedDevice.set(selectedDevice);
    }
    const landscape = this.landscape();
    this.currentIFrameHeight.set(landscape ? selectedDevice.width : selectedDevice.height);
    this.currentIFrameWidth.set(landscape ? selectedDevice.height : selectedDevice.width);
    this.showNotch.set(selectedDevice.notch ?? false);
    this.mode.set(selectedDevice.mode);
    localStorage.setItem('si-live-preview-selected-device', selectedDevice.id);
    if (!this.directlyEmbedExamples) {
      this.sendMessage();
    }
  }

  private onMessage(event: MessageEvent): void {
    if (
      event.data?.src !== 'renderer' ||
      event.source !== this.previewIframe()?.nativeElement.contentWindow
    ) {
      return;
    }
    this.ngZone.run(() => this.onMessageInZone(event));
  }

  private onMessageInZone(event: MessageEvent): void {
    switch (event.data.type) {
      case 'ready':
        this.sendMessage();
        break;
      case 'landscapeMode':
        this.landscapeSupportChanged(event.data.message);
        break;
      case 'clear':
        this.logClear.emit();
        break;
      case 'log':
        this.logMessage.emit(event.data.message);
        break;
      case 'error':
        this.logRenderingError.emit(event.data.message);
        break;
      case 'progress':
        this.onRendererProgress(event.data.message);
        break;
      case 'templateFromComponent':
        this.onTemplateFromComponent(event.data.message);
        break;
      case 'theme':
        this.theme.set(event.data.message);
        break;
      case 'locale':
        this.locale.set(event.data.message);
        break;
    }
  }

  landscapeSupportChanged(supported: boolean): void {
    this.supportsLandscape.set(supported);
    if (!supported && this.landscape()) {
      this.landscape.set(false);
      this.deviceChanged();
    }
  }

  onTemplateFromComponent(template: string | undefined): void {
    this.originalTemplate = template ?? '';
    this.templateModified = false;
    this.templateFromComponent.emit(template);
  }

  onRendererProgress(progress: boolean): void {
    if (progress !== this.rendererInProgress) {
      this.rendererInProgress = progress;
      this.inProgress.emit(progress);
    }
  }

  onPreviewClick(event: MouseEvent): void {
    if (!this.directlyEmbedExamples) {
      return;
    }
    const target = (event.target as HTMLElement).closest('a');
    if (
      target &&
      !event.defaultPrevented &&
      ['', '_self', '_top', '_parent'].includes(target.target)
    ) {
      const url = target.href;
      if (url && !url.startsWith(window.location.toString())) {
        event.preventDefault();
        window.open(url, '_blank');
      }
    }
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    if (!this.directlyEmbedExamples) {
      this.sendMessage();
    }
  }

  toggleLandscape(): void {
    const landscape = !this.landscape();
    this.landscape.set(landscape);
    const selectedDevice = this.selectedDevice();
    this.currentIFrameHeight.set(landscape ? selectedDevice?.width : selectedDevice?.height);
    this.currentIFrameWidth.set(landscape ? selectedDevice?.height : selectedDevice?.width);
    if (!this.directlyEmbedExamples) {
      this.sendMessage();
    }
  }

  openQrMenu(): void {
    this.plainUrl.set(this.createTemplateLink('plain'));
    this.plainUrlShort.set(this.createTemplateLink('plain', true));
    this.showQrMenu.set(true);
  }

  private createTemplateLink(mode: string, skipTemplate = false): string {
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += `#/viewer/${mode}?`;
    url += 'theme=' + this.theme();
    url += '&mode=' + this.mode();
    if (this.isRTL()) {
      url += '&isRTL=true';
    }
    const locale = this.locale();
    if (locale) {
      url += '&locale=' + locale;
    }
    if (this.rootFontSize()) {
      url += '&rfs=' + this.rootFontSize();
    }
    if (this.templateModified && !skipTemplate) {
      url += '&t=' + this.encode(this.template());
    }
    const exampleUrl = this.exampleUrl();
    if (exampleUrl) {
      url += '&e=' + this.encode(exampleUrl);
    }
    return url;
  }

  private encode(value: string): string {
    // using `+` for space is shorter than `%20`
    return encodeURIComponent(value).replace(/%20/g, '+');
  }

  private sendMessage(): void {
    const landscape = this.landscape();
    const selectedDevice = this.selectedDevice();
    this.previewIframe()?.nativeElement.contentWindow?.postMessage(
      {
        src: 'editor',
        exampleUrl: this.baseUrl() + this.exampleUrl(),
        template: this.template(),
        loadReact: this.loadReact(),
        loadVue: this.loadVue(),
        loadJs: this.loadJs(),
        reactVueTemplate: this.reactVueTemplate(),
        theme: this.theme(),
        locale: this.locale(),
        rootFontSize: this.rootFontSize(),
        isRTL: this.isRTL(),
        mode: this.mode(),
        safeAreaTop: landscape
          ? selectedDevice?.safeAreaLandscape?.top
          : selectedDevice?.safeAreaPortrait?.top,
        safeAreaBottom: landscape
          ? selectedDevice?.safeAreaLandscape?.bottom
          : selectedDevice?.safeAreaPortrait?.bottom,
        safeAreaLeft: landscape
          ? selectedDevice?.safeAreaLandscape?.left
          : selectedDevice?.safeAreaPortrait?.left,
        safeAreaRight: landscape
          ? selectedDevice?.safeAreaLandscape?.right
          : selectedDevice?.safeAreaPortrait?.right
      },
      '*'
    );
  }
}
