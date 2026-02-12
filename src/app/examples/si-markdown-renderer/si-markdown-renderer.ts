/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-sample',
  imports: [SiMarkdownRendererComponent],
  templateUrl: './si-markdown-renderer.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly markdownText = signal<string>('');
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.http.get('assets/sample-markdown.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
      this.cdRef.markForCheck();
    });
  }
}
