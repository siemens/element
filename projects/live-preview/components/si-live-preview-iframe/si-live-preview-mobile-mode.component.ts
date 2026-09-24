/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SI_LIVE_PREVIEW_CONFIG } from '../../interfaces/live-preview-config';
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { SiLivePreviewQrComponent } from '../si-live-preview-qr/si-live-preview-qr.component';
import { availableDevices, Device } from './devices';

@Component({
  selector: 'si-live-preview-mobile-mode',
  imports: [FormsModule, SiLivePreviewQrComponent],
  templateUrl: './si-live-preview-mobile-mode.component.html',
  styleUrl: './si-live-preview-mobile-mode.component.scss'
})
export class SiLivePreviewMobileModeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly previewIframe = viewChild.required<ElementRef>('previewIframe');
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  protected readonly state = inject(LivePreviewStateService);

  readonly iframeChange = output<ElementRef | undefined>();

  protected readonly switcherEnabled = this.config.themeSwitcher;
  protected readonly landscapeEnabled = this.config.landscapeToggle;
  protected readonly availableDevices = availableDevices;
  protected readonly selectedDevice = signal<Device | undefined>(undefined);
  protected readonly landscape = signal(false);
  protected readonly showQrMenu = signal(false);
  protected readonly plainUrl = signal('');
  protected readonly plainUrlShort = signal('');
  protected readonly mode = computed(() => this.selectedDevice()?.mode ?? 'ios');
  protected readonly showNotch = computed(() => this.selectedDevice()?.notch ?? false);
  protected readonly currentIFrameHeight = computed(() => {
    const device = this.selectedDevice();
    return device ? (this.landscape() ? device.width : device.height) : this.state.iFrameHeight();
  });
  protected readonly currentIFrameWidth = computed(() => {
    const device = this.selectedDevice();
    return device ? (this.landscape() ? device.height : device.width) : this.state.iFrameWidth();
  });

  constructor() {
    effect(() => {
      if (!this.state.supportsLandscape() && this.landscape()) {
        this.landscape.set(false);
        this.emitViewport();
      }
    });
  }

  ngOnInit(): void {
    const deviceId = localStorage.getItem('si-live-preview-selected-device');
    this.selectDevice(this.availableDevices.find(device => device.id === deviceId));
  }

  ngAfterViewInit(): void {
    this.iframeChange.emit(this.previewIframe());
  }

  ngOnDestroy(): void {
    this.iframeChange.emit(undefined);
  }

  protected selectDevice(device?: Device): void {
    const selectedDevice = device ?? this.availableDevices[0];
    this.selectedDevice.set(selectedDevice);
    localStorage.setItem('si-live-preview-selected-device', selectedDevice.id);
    this.emitViewport();
  }

  protected deviceChanged(): void {
    this.selectDevice(this.selectedDevice());
  }

  protected toggleLandscape(): void {
    this.landscape.update(landscape => !landscape);
    this.emitViewport();
  }

  protected openQrMenu(): void {
    this.plainUrl.set(this.createTemplateLink(false));
    this.plainUrlShort.set(this.createTemplateLink(true));
    this.showQrMenu.set(true);
  }

  private emitViewport(): void {
    const device = this.selectedDevice();
    const safeArea = this.landscape() ? device?.safeAreaLandscape : device?.safeAreaPortrait;
    this.state.viewport.set({
      mode: this.mode(),
      safeAreaTop: safeArea?.top,
      safeAreaBottom: safeArea?.bottom,
      safeAreaLeft: safeArea?.left,
      safeAreaRight: safeArea?.right
    });
  }

  private createTemplateLink(skipTemplate: boolean): string {
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += '#/viewer/plain?';
    url += 'theme=' + this.state.theme();
    url += '&mode=' + this.mode();
    if (this.state.isRTL()) {
      url += '&isRTL=true';
    }
    const locale = this.state.locale();
    if (locale) {
      url += '&locale=' + locale;
    }
    if (this.state.rootFontSize()) {
      url += '&rfs=' + this.state.rootFontSize();
    }
    if (this.state.templateModified() && !skipTemplate) {
      url += '&t=' + this.encode(this.state.template());
    }
    const exampleUrl = this.state.example();
    if (exampleUrl) {
      url += '&e=' + this.encode(exampleUrl);
    }
    return url;
  }

  private encode(value: string): string {
    // Using `+` for spaces produces shorter QR code URLs than `%20`.
    return encodeURIComponent(value).replace(/%20/g, '+');
  }
}
