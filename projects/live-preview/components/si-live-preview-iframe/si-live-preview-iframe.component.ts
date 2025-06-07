/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import { availableDevices, Device } from './devices';

@Component({
  selector: 'si-live-preview-iframe',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './si-live-preview-iframe.component.html',
  styleUrl: './si-live-preview-iframe.component.scss'
})
export class SiLivePreviewIframeComponent implements OnInit, OnChanges {
  readonly previewIframe = viewChild<ElementRef>('previewIframe');

  @Input() baseUrl!: string;
  @Input() exampleUrl!: string;
  @Input() template!: string;
  @Input() ticketLinkBug!: string;
  @Input() ticketLinkFeature!: string;
  @Input() isFullscreen = false;
  @Input() iFrameHeight?: string;
  @Input() iFrameWidth?: string;
  @Input() theme = 'light';
  @Input() locale?: string;
  @Input() isRTL?: boolean;
  @Input() loadReact?: boolean;
  @Input() loadVue?: boolean;
  @Input() loadJs?: boolean;
  @Input() reactVueTemplate?: string;

  @Output() readonly templateFromComponent = new EventEmitter<string | undefined>(true);
  @Output() readonly logClear = new EventEmitter();
  @Output() readonly logMessage = new EventEmitter<string>();
  @Output() readonly logRenderingError = new EventEmitter<any>();
  @Output() readonly inProgress = new EventEmitter<boolean>();
  @Output() readonly themeChange = new EventEmitter<string>();
  @Output() readonly localeChange = new EventEmitter<string>();

  private originalTemplate = '';
  private templateModified = false;
  private rendererInProgress = false;

  private config = inject(SI_LIVE_PREVIEW_CONFIG);
  private internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  @HostBinding('class.is-mobile') protected isMobile = this.internalConfig.isMobile;

  protected mode = 'ios';
  protected landscape = false;

  protected switcherEnabled = this.config.themeSwitcher;

  protected landscapeEnabled = this.config.landscapeToggle;
  protected supportsLandscape = false;

  protected availableDevices = availableDevices;
  protected selectedDevice?: Device;
  protected showNotch!: boolean;
  protected showQrMenu = false;
  protected plainUrl = '';
  protected plainUrlShort = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.previewIframe()) {
      return;
    }

    if (changes.template) {
      this.templateModified = this.originalTemplate !== this.template;
    }

    this.sendMessage();
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() =>
      fromEvent<MessageEvent>(window, 'message')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(message => this.onMessage(message))
    );

    if (this.isMobile) {
      const deviceId = localStorage.getItem('si-live-preview-selected-device');
      this.selectedDevice =
        this.availableDevices.find(dev => dev.id === deviceId) ?? this.availableDevices[0];
      this.deviceChanged();
    }
  }

  deviceChanged(): void {
    this.selectedDevice ??= this.availableDevices[0];
    this.iFrameHeight = this.landscape ? this.selectedDevice.width : this.selectedDevice.height;
    this.iFrameWidth = this.landscape ? this.selectedDevice.height : this.selectedDevice.width;
    this.showNotch = this.selectedDevice.notch ?? false;
    this.mode = this.selectedDevice.mode;
    localStorage.setItem('si-live-preview-selected-device', this.selectedDevice.id);
    this.sendMessage();
  }

  private onMessage(event: MessageEvent): void {
    if (!event.data || event.data.src !== 'renderer') {
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
        this.supportsLandscape = event.data.message;
        if (!this.supportsLandscape && this.landscape) {
          this.landscape = false;
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
        this.theme = event.data.message;
        this.themeChange.emit(event.data.message);
        break;
      case 'locale':
        this.locale = event.data.message;
        this.localeChange.emit(event.data.message);
        break;
    }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.themeChange.emit(this.theme);
    this.sendMessage();
  }

  toggleLandscape(): void {
    this.landscape = !this.landscape;
    this.iFrameHeight = this.landscape ? this.selectedDevice?.width : this.selectedDevice?.height;
    this.iFrameWidth = this.landscape ? this.selectedDevice?.height : this.selectedDevice?.width;
    this.sendMessage();
  }

  openQrMenu(): void {
    this.plainUrl = this.createTemplateLink('plain');
    this.plainUrlShort = this.createTemplateLink('plain', true);
    this.showQrMenu = true;
  }

  private createTemplateLink(mode: string, skipTemplate = false): string {
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += `#/viewer/${mode}?`;
    url += 'theme=' + this.theme;
    url += '&mode=' + this.mode;
    if (this.isRTL) {
      url += '&isRTL=true';
    }
    if (this.locale) {
      url += '&locale=' + this.locale;
    }
    if (this.templateModified && !skipTemplate) {
      url += '&t=' + this.encode(this.template);
    }
    if (this.exampleUrl) {
      url += '&e=' + this.encode(this.exampleUrl);
    }
    return url;
  }

  private encode(value: string): string {
    // using `+` for space is shorter than `%20`
    return encodeURIComponent(value).replace(/%20/g, '+');
  }

  private sendMessage(): void {
    this.previewIframe()?.nativeElement.contentWindow.postMessage(
      {
        src: 'editor',
        exampleUrl: this.baseUrl + this.exampleUrl,
        template: this.template,
        loadReact: this.loadReact,
        loadVue: this.loadVue,
        loadJs: this.loadJs,
        reactVueTemplate: this.reactVueTemplate,
        theme: this.theme,
        locale: this.locale,
        isRTL: this.isRTL,
        mode: this.mode,
        safeAreaTop: this.landscape
          ? this.selectedDevice?.safeAreaLandscape?.top
          : this.selectedDevice?.safeAreaPortrait?.top,
        safeAreaBottom: this.landscape
          ? this.selectedDevice?.safeAreaLandscape?.bottom
          : this.selectedDevice?.safeAreaPortrait?.bottom,
        safeAreaLeft: this.landscape
          ? this.selectedDevice?.safeAreaLandscape?.left
          : this.selectedDevice?.safeAreaPortrait?.left,
        safeAreaRight: this.landscape
          ? this.selectedDevice?.safeAreaLandscape?.right
          : this.selectedDevice?.safeAreaPortrait?.right
      },
      '*'
    );
  }
}
