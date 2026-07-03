/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  output
} from '@angular/core';
import qrcode from 'qrcode-generator';

@Component({
  selector: 'si-live-preview-qr',
  templateUrl: './si-live-preview-qr.component.html',
  styleUrl: './si-live-preview-qr.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiLivePreviewQrComponent implements AfterViewInit, OnDestroy {
  readonly url = input<string>();
  readonly urlShort = input<string>();
  readonly closed = output<void>();

  readonly qrImg = computed<string | null>(() => {
    const url = this.url();
    const urlShort = this.urlShort();
    if (!url || !urlShort) {
      return null;
    }
    const qr = qrcode(0, 'L');
    qr.addData(this.qrShort() ? urlShort : url);
    qr.make();
    return qr.createImgTag(2);
  });

  readonly qrShort = computed(() => (this.url()?.length ?? 0) > 2953);

  private unlisten?: () => void;

  ngAfterViewInit(): void {
    const listener = (): void => this.closed.emit();
    setTimeout(() => window.addEventListener('click', listener));
    this.unlisten = () => window.removeEventListener('click', listener);
  }

  ngOnDestroy(): void {
    if (this.unlisten) {
      this.unlisten();
    }
  }
}
