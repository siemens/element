/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnInit,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { SiLivePreviewIframeModeComponent } from './si-live-preview-iframe-mode.component';
import { SiLivePreviewMobileModeComponent } from './si-live-preview-mobile-mode.component';

@Component({
  selector: 'si-live-preview-iframe',
  imports: [SiLivePreviewIframeModeComponent, SiLivePreviewMobileModeComponent],
  templateUrl: './si-live-preview-iframe.component.html',
  styleUrl: './si-live-preview-iframe.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.is-mobile]': 'isMobile'
  }
})
export class SiLivePreviewIframeComponent implements OnInit {
  readonly isFullscreen = input(false);

  readonly templateFromComponent = output<string | undefined>();

  protected readonly state = inject(LivePreviewStateService);
  private rendererInProgress = false;
  private readonly previewIframeRef = signal<ElementRef | undefined>(undefined);

  readonly previewIframe = this.previewIframeRef.asReadonly();

  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdRef = inject(ChangeDetectorRef);

  protected readonly isMobile = this.internalConfig.isMobile;
  protected readonly ticketLinkBug = computed(
    () =>
      `${this.config.ticketBaseUrl}?issue%5Btitle%5D=%3C${this.state.example()}%3E:&issuable_template=Bug`
  );
  protected readonly ticketLinkFeature = computed(
    () =>
      `${this.config.ticketBaseUrl}?issue%5Btitle%5D=%3C${this.state.example()}%3E:&issuable_template=Feature Request`
  );

  constructor() {
    effect(() => {
      // recompute on template changes and re-send whenever any rendered input changes
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
        this.state.supportsLandscape.set(event.data.message);
        break;
      case 'clear':
        this.state.clearLogs(true);
        break;
      case 'log':
        this.state.addLog(event.data.message);
        break;
      case 'error':
        this.state.renderingError.set(event.data.message);
        break;
      case 'progress':
        {
          const progress: boolean = event.data.message;
          if (progress !== this.rendererInProgress) {
            // only emit changes since live-previewer does counting
            this.rendererInProgress = progress;
            this.state.setRenderingProgress(progress);
          }
        }
        break;
      case 'templateFromComponent':
        this.state.originalTemplate.set(event.data.message ?? '');
        this.templateFromComponent.emit(event.data.message);
        break;
      case 'theme':
        this.state.theme.set(event.data.message);
        break;
      case 'locale':
        this.state.locale.set(event.data.message);
        break;
    }
  }

  toggleTheme(): void {
    this.state.toggleTheme();
    this.sendMessage();
  }

  protected setPreviewIframe(iframe: ElementRef | undefined): void {
    this.previewIframeRef.set(iframe);
  }

  private sendMessage(): void {
    const viewport = this.state.viewport();
    this.previewIframe()?.nativeElement.contentWindow.postMessage(
      {
        src: 'editor',
        exampleUrl: this.state.example(),
        template: this.state.template(),
        loadReact: this.state.loadReact(),
        loadVue: this.state.loadVue(),
        loadJs: this.state.loadJs(),
        reactVueTemplate: this.state.activeWebComponentTemplate(),
        theme: this.state.theme(),
        locale: this.state.locale(),
        rootFontSize: this.state.rootFontSize(),
        isRTL: this.state.isRTL(),
        mode: viewport.mode,
        safeAreaTop: viewport.safeAreaTop,
        safeAreaBottom: viewport.safeAreaBottom,
        safeAreaLeft: viewport.safeAreaLeft,
        safeAreaRight: viewport.safeAreaRight
      },
      '*'
    );
  }
}
