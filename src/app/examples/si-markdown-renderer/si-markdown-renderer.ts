/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HttpClient } from '@angular/common/http';
import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';
import hljs from 'highlight.js';

@Component({
  selector: 'app-sample',
  imports: [SiMarkdownRendererComponent],
  templateUrl: './si-markdown-renderer.html'
})
export class SampleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  readonly markdownText = signal<string>('');

  // Optional: Syntax highlighting with highlight.js
  // This function returns classes for the code element. Libraries like highlight.js
  // can then be used to apply syntax highlighting based on these classes.
  // Call hljs.highlightAll() after rendering to activate highlighting.
  // Element provides a built-in theme that adapts to light/dark mode.
  // Alternatively, you can import a highlight.js theme in your global styles, e.g.:
  // @import 'highlight.js/styles/github-dark.css';
  readonly syntaxHighlighter = (code: string, language?: string): string => {
    if (language && hljs.getLanguage(language)) {
      this.zone.runOutsideAngular(() => setTimeout(() => hljs.highlightAll()));
      return `class="hljs language-${language}"`;
    }
    return 'class="hljs"';
  };

  ngOnInit(): void {
    this.http.get('assets/sample-markdown.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
    });
  }
}
