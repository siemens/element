/**
 * Copyright (c) Siemens 2016 - 2025
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
import hljs from 'highlight.js';
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

  // Optional: Syntax highlighting with highlight.js
  // This function returns highlighted HTML markup for the code content.
  // The returned HTML is sanitized before insertion.
  // Element provides a built-in highlight.js theme that adapts to light/dark mode.
  // Make sure to include highlight.js as a dependency.
  readonly syntaxHighlighter = (code: string, language?: string): string | undefined => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch {
        // If highlighting fails, fall back to no highlighting
      }
    }
    return undefined;
  };

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
