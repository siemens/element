/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Literal, type Node, type Parent } from 'mdast';
import mermaid, { MermaidConfig } from 'mermaid';

import { SiMarkdownExtensionComponent } from '../../si-markdown.types';
import { computedAsync } from '../../utils/signal-utils';

@Component({
  selector: 'si-markdown-mermaid',
  template: '<div [id]="id"></div><div [innerHTML]="svg()"></div>'
})
export class SiMarkdownMermaidComponent implements SiMarkdownExtensionComponent {
  private static idCounter = 1;
  protected id = `__si-markdown-mermaid-${SiMarkdownMermaidComponent.idCounter++}`;

  private readonly sanitizer = inject(DomSanitizer);
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<MermaidConfig>();

  protected readonly code = computed(() => (this.node() as Literal).value);

  protected readonly svg = computedAsync({
    params: () => ({ options: this.options(), code: this.code() }),
    computation: params => this.render(params.code, params.options),
    initial: undefined
  });

  constructor() {
    mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true });
  }

  private async render(code: string, options: MermaidConfig = {}): Promise<SafeHtml> {
    if (!code) {
      return '';
    }
    try {
      mermaid.initialize({ ...options, startOnLoad: false, suppressErrorRendering: true });
      await new Promise(resolve => setTimeout(resolve)); // this is necessary for mermaid to init
      const ret = await mermaid.render(this.id, code);
      return this.sanitizer.bypassSecurityTrustHtml(ret.svg);
    } catch (err) {
      return '';
    }
  }
}
