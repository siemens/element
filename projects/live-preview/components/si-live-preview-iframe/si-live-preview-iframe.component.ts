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
  model,
  NgZone,
  OnInit,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { SI_LIVE_PREVIEW_INTERNALS } from '../../interfaces/live-preview-config';
import { LivePreviewViewport } from './live-preview-mode';
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

  private readonly originalTemplate = signal('');
  protected readonly templateModified = computed(() => this.originalTemplate() !== this.template());
  private rendererInProgress = false;
  private readonly previewIframeRef = signal<ElementRef | undefined>(undefined);

  readonly previewIframe = this.previewIframeRef.asReadonly();

  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdRef = inject(ChangeDetectorRef);

  protected readonly isMobile = this.internalConfig.isMobile;
  protected readonly supportsLandscape = signal(false);
  protected readonly viewport = signal<LivePreviewViewport>({ mode: 'ios' });

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
        this.supportsLandscape.set(event.data.message);
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
        this.originalTemplate.set(event.data.message);
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

  protected setPreviewIframe(iframe: ElementRef | undefined): void {
    this.previewIframeRef.set(iframe);
  }

  protected setViewport(viewport: LivePreviewViewport): void {
    this.viewport.set(viewport);
  }

  private sendMessage(): void {
    const viewport = this.viewport();
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
