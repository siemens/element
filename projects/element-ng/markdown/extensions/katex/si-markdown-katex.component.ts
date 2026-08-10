/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { type KatexOptions, render } from 'katex';
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
    '[attr.data-line]': 'node().position?.start?.line',
    '[class.d-block]': 'displayMode()'
  }
})
export class SiMarkdownKatexComponent implements SiMarkdownExtensionComponent {
  private readonly elementRef = inject(ElementRef);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<KatexOptions>();

  protected readonly displayMode = computed(() => this.node().type === 'math');
  private readonly expr = computed(() => (this.node() as Literal).value);

  constructor() {
    effect(() => this.render());
  }

  private render(): void {
    const expr = this.expr();
    const options = this.options() ?? {};
    render(expr, this.elementRef.nativeElement, {
      ...options,
      displayMode: this.displayMode(),
      throwOnError: false
    });
  }
}
