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
import {
  injectMarkdownRenderer,
  SiMarkdownRendererComponent
} from '@siemens/element-ng/markdown-renderer';
import hljs from 'highlight.js';
import { math, mathHtml } from 'micromark-extension-math';

@Component({
  selector: 'app-sample',
  imports: [SiMarkdownRendererComponent],
  templateUrl: './si-markdown-renderer.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private cdRef = inject(ChangeDetectorRef);
  readonly markdownText = signal<string>('');

  protected renderer = injectMarkdownRenderer({
    syntaxHighlighter: (code: string, language?: string): string | undefined => {
      if (language && hljs.getLanguage(language)) {
        try {
          return hljs.highlight(code, { language }).value;
        } catch {
          // fall back to no highlighting
        }
      }
      return undefined;
    },
    mathExtensions: {
      syntax: math(),
      html: mathHtml({ throwOnError: false, output: 'html' })
    }
  });

  ngOnInit(): void {
    this.http.get('assets/sample-markdown.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
      this.cdRef.markForCheck();
    });
  }
}
