/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
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

import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import { SiLivePreviewQrComponent } from '../si-live-preview-qr/si-live-preview-qr.component';
import { availableDevices, Device } from './devices';

@Component({
  selector: 'si-live-preview-iframe',
  imports: [FormsModule, SiLivePreviewQrComponent],
  templateUrl: './si-live-preview-iframe.component.html',
  styleUrl: './si-live-preview-iframe.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.is-mobile]': 'isMobile'
  }
})
export class SiLivePreviewIframeComponent implements OnInit {
  readonly previewIframe = viewChild<ElementRef>('previewIframe');

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
  private rendererInProgress = false;

  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdRef = inject(ChangeDetectorRef);

  protected readonly isMobile = this.internalConfig.isMobile;

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
    effect(() => {
      // recompute on template changes and re-send whenever any rendered input changes
      this.templateModified = this.originalTemplate !== this.template();
      if (this.previewIframe()) {
        this.sendMessage();
      }
    });
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() =>
      fromEvent<MessageEvent>(window, 'message')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(message => {
          this.onMessage(message);
          this.cdRef.markForCheck();
        })
    );

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
    this.sendMessage();
  }

  private onMessage(event: MessageEvent): void {
    if (event.data?.src !== 'renderer') {
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
        this.supportsLandscape.set(event.data.message);
        if (!this.supportsLandscape() && this.landscape()) {
          this.landscape.set(false);
          this.deviceChanged();
        }
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
        {
          const progress: boolean = event.data.message;
          if (progress !== this.rendererInProgress) {
            // only emit changes since live-previewer does counting
            this.rendererInProgress = progress;
            this.inProgress.emit(progress);
          }
        }
        break;
      case 'templateFromComponent':
        this.originalTemplate = event.data.message;
        this.templateModified = false;
        this.templateFromComponent.emit(event.data.message);
        break;
      case 'theme':
        this.theme.set(event.data.message);
        break;
      case 'locale':
        this.locale.set(event.data.message);
        break;
    }
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    this.sendMessage();
  }

  toggleLandscape(): void {
    const landscape = !this.landscape();
    this.landscape.set(landscape);
    const selectedDevice = this.selectedDevice();
    this.currentIFrameHeight.set(landscape ? selectedDevice?.width : selectedDevice?.height);
    this.currentIFrameWidth.set(landscape ? selectedDevice?.height : selectedDevice?.width);
    this.sendMessage();
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
    this.previewIframe()?.nativeElement.contentWindow.postMessage(
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
