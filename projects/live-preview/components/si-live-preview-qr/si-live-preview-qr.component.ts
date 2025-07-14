/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges
} from '@angular/core';
import qrcode from 'qrcode-generator';

@Component({
  selector: 'si-live-preview-qr',
  templateUrl: './si-live-preview-qr.component.html',
  styleUrl: './si-live-preview-qr.component.scss'
})
export class SiLivePreviewQrComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() url?: string;
  @Input() urlShort?: string;
  readonly closed = output<void>();

  qrImg = '';
  qrShort = false;

  private unlisten?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.url && changes.urlShort) {
      this.generateQr();
    }
  }

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

  private generateQr(): void {
    this.qrShort = (this.url?.length ?? 0) > 2953;
    const url = this.qrShort ? this.urlShort! : this.url!;
    const qr = qrcode(0, 'L');
    qr.addData(url);
    qr.make();
    this.qrImg = qr.createImgTag(2);
  }
}
