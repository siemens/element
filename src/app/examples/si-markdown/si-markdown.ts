/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { makeSiMarkdownOptions, SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/katex';
import { siMarkdownMermaid } from '@siemens/element-ng/markdown/extensions/mermaid';
import { siMarkdownHighlightJs } from '@siemens/element-ng/markdown/hightlighter/highlightjs';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import remarkGemoji from 'remark-gemoji';

@Component({
  selector: 'app-sample',
  imports: [
    SiMarkdownComponent,
    SiNumberInputComponent,
    FormsModule,
    SiFormItemComponent,
    SiAccordionComponent,
    SiCollapsiblePanelComponent
  ],
  templateUrl: './si-markdown.html'
})
export class SampleComponent implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly markdownOptions = computed(() => {
    const opts = makeSiMarkdownOptions();
    if (this.useHighlightJs()) {
      opts.setCodeHighlighter(siMarkdownHighlightJs({ autoDetectLanguage: this.autoDetectLang() }));
    }
    if (this.useKatex()) {
      opts.installExtension(
        // can pass options to KaTeX here. E.g. default rendering is HTML only (speed)
        siMarkdownMathKaTeX(undefined, { output: 'htmlAndMathml' })
      );
    }
    if (this.useMermaid()) {
      opts.installExtension(siMarkdownMermaid());
    }
    if (this.useGemojis()) {
      opts.installUnifiedPlugin(remarkGemoji);
    }

    return opts;
  });

  protected readonly markdownText = signal<string>('');
  protected readonly markdownTextForRenderer = signal<string>('');
  protected readonly streaming = signal(false);
  protected readonly streamIterationDelay = signal(30);
  protected readonly streamCharsPerIteration = signal(15);
  protected readonly keepScrollBottom = signal(false);

  protected readonly useHighlightJs = signal(true);
  protected readonly autoDetectLang = signal(true);
  protected readonly useKatex = signal(true);
  protected readonly useMermaid = signal(true);
  protected readonly useGemojis = signal(true);
  protected readonly debug = signal(false);

  ngOnInit(): void {
    this.http.get('assets/sample-markdown-ext.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
      this.updateRenderer();
    });
  }

  protected updateRenderer(): void {
    if (!this.streaming()) {
      this.markdownTextForRenderer.set(this.markdownText());
    }
  }

  protected start(): void {
    this.streaming.set(true);
    this.streamTextToRenderer();
  }

  protected stop(): void {
    this.streaming.set(false);
    this.updateRenderer();
  }

  private async streamTextToRenderer(): Promise<void> {
    this.markdownTextForRenderer.set('');

    const delay = this.streamIterationDelay();
    const chars = this.streamCharsPerIteration();
    const text = this.markdownText();

    let forRenderer = '';

    while (text.length > forRenderer.length && this.streaming()) {
      forRenderer += text.substring(forRenderer.length, forRenderer.length + chars);
      this.markdownTextForRenderer.set(forRenderer);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.streaming.set(false);
  }
}
