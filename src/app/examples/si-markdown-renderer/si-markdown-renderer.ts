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
import katex from 'katex';

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

  // Optional: LaTeX rendering with KaTeX
  // This function returns rendered HTML for LaTeX math expressions.
  // The returned HTML is sanitized before insertion.
  // Make sure to include KaTeX styles in your application.
  // Add to styles in angular.json: "node_modules/katex/dist/katex.min.css"
  readonly latexRenderer = (latex: string, displayMode: boolean): string | undefined => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: 'html'
      });
    } catch {
      // If rendering fails, return undefined to use default rendering
      return undefined;
    }
  };

  ngOnInit(): void {
    this.http.get('assets/sample-markdown.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
      this.cdRef.markForCheck();
    });
  }
}
