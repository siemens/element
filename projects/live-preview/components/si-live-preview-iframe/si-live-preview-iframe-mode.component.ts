/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  output,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { LivePreviewUrlService } from '../../services/live-preview-url.service';

@Component({
  selector: 'si-live-preview-iframe-mode',
  template: `<iframe #previewIframe title="Example view" [src]="previewUrl"></iframe>`,
  styles: `
    :host {
      display: block;
      flex: 1;
      min-block-size: 0;
    }

    iframe {
      border: 0;
      display: block;
      block-size: 100%;
      inline-size: 100%;
    }
  `
})
export class SiLivePreviewIframeModeComponent implements AfterViewInit, OnDestroy {
  protected readonly previewUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    inject(LivePreviewUrlService).iframeUrl
  );
  private readonly previewIframe = viewChild.required<ElementRef>('previewIframe');

  readonly iframeChange = output<ElementRef | undefined>();

  ngAfterViewInit(): void {
    this.iframeChange.emit(this.previewIframe());
  }

  ngOnDestroy(): void {
    this.iframeChange.emit(undefined);
  }
}
