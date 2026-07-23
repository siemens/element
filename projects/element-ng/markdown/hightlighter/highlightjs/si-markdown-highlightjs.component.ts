/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, effect, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { type Language } from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import langBash from 'highlight.js/lib/languages/bash';
import langCss from 'highlight.js/lib/languages/css';
import langJs from 'highlight.js/lib/languages/javascript';
import langJson from 'highlight.js/lib/languages/json';
import langPython from 'highlight.js/lib/languages/python';
import langScss from 'highlight.js/lib/languages/scss';
import langTs from 'highlight.js/lib/languages/typescript';
import langXml from 'highlight.js/lib/languages/xml';

import { SiMarkdownHighlighterComponent } from '../../si-markdown.types';
import { computedAsync } from '../../utils/signal-utils';
import { hljsLanguageLoader } from './hljs-language-loader';
import { SiMarkdownHighlightJsOptions } from './si-markdown-highlightjs.types';

// some common languages are built-in for initial loading speed
hljs.registerLanguage('javascript', langJs);
hljs.registerLanguage('typescript', langTs);
hljs.registerLanguage('json', langJson);
hljs.registerLanguage('css', langCss);
hljs.registerLanguage('scss', langScss);
hljs.registerLanguage('bash', langBash);
hljs.registerLanguage('python', langPython);
hljs.registerLanguage('xml', langXml);

const getHljsLang = async (lang: string): Promise<Language | undefined> => {
  const loadedLang = hljs.getLanguage(lang);
  if (loadedLang) {
    return loadedLang;
  }
  const importLang = await hljsLanguageLoader(lang);
  if (importLang) {
    hljs.registerLanguage(lang, importLang.default);
    return hljs.getLanguage(lang);
  }
  return undefined;
};

@Component({
  selector: 'si-markdown-highlightjs',
  templateUrl: './si-markdown-highlightjs.component.html',
  styleUrl: './si-markdown-highlightjs.component.scss',
  host: {
    class: 'd-block'
  }
})
export class SiMarkdownHightlightJsComponent implements SiMarkdownHighlighterComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly code = input.required<string>();
  readonly language = input.required<string>();
  readonly updateLanguage = input.required<(lang?: string) => void>();
  readonly options = input<SiMarkdownHighlightJsOptions>();

  constructor() {
    effect(() => {
      const opts = this.options();
      for (const l of opts?.languages ?? []) {
        if (!hljs.getLanguage(l.name)) {
          hljs.registerLanguage(l.name, l.lang);
        }
      }
    });
  }

  protected readonly highlighted = computedAsync({
    params: () => ({ code: this.code(), language: this.language(), options: this.options() }),
    computation: params => this.highlight(params.code, params.language, params.options),
    initial: undefined
  });

  private async highlight(
    code: string,
    language: string,
    options: SiMarkdownHighlightJsOptions = {}
  ): Promise<SafeHtml> {
    let highlighted = '';
    if (options?.autoDetectLanguage) {
      try {
        const res = hljs.highlightAuto(code, language ? [language] : undefined);
        highlighted = res.value;
        if (res.language) {
          const lang = hljs.getLanguage(res.language);
          this.updateLanguage()(lang?.name);
        } else {
          this.updateLanguage()(language);
        }
      } catch {
        // ignored
      }
    } else {
      await new Promise(resolve => setTimeout(resolve));
      const hljsLang = await getHljsLang(language);
      if (hljsLang) {
        this.updateLanguage()(hljsLang.name);
        try {
          highlighted = hljs.highlight(code, { ...options, language }).value;
        } catch {
          // ignored
        }
      } else {
        this.updateLanguage()(language);
      }
    }
    return highlighted ? this.sanitizer.bypassSecurityTrustHtml(highlighted) : '';
  }
}
