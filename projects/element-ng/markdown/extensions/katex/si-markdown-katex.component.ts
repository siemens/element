/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  inject,
  input,
  SecurityContext,
  ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { type KatexOptions, renderToString } from 'katex';
import { Literal, type Node, type Parent } from 'mdast';

import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-katex',
  template: '',
  styleUrl: 'si-markdown-katex.component.scss',
  // this is necessary for the styles to work correctly
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'katex-container',
    '[class.d-block]': 'displayMode()',
    '[class.text-danger]': 'html().error',
    '[title]': 'html().error',
    '[innerHTML]': 'html().html'
  }
})
export class SiMarkdownKatexComponent implements SiMarkdownExtensionComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<KatexOptions>();

  protected readonly displayMode = computed(() => this.node().type === 'math');
  private readonly expr = computed(() => (this.node() as Literal).value);
  protected readonly html = computed(() => this.render());

  private render(): { html: SafeHtml; error: string } {
    const expr = this.expr();
    try {
      const options = this.options() ?? {};
      const html = renderToString(expr, { ...options, displayMode: this.displayMode() });
      return {
        html: this.sanitizer.bypassSecurityTrustHtml(html),
        error: ''
      };
    } catch (error: any) {
      return {
        html: this.sanitizer.sanitize(SecurityContext.HTML, expr) as SafeHtml,
        error: error.toString()
      };
    }
  }
}
