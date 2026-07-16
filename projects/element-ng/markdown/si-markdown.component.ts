/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgComponentOutlet } from '@angular/common';
import {
  Component,
  input,
  viewChildren,
  contentChildren,
  computed,
  TemplateRef
} from '@angular/core';
import { Root, type Node } from 'mdast';
import { Processor } from 'unified';

import { SiMarkdownFragmentComponent } from './si-markdown-fragment.component';
import { SiMarkdownOptions } from './si-markdown-options';
import { SiMarkdownTemplateDirective } from './si-markdown-template.directive';
import { SI_MARKDOWN_CONTROL, SiMarkdownControl } from './si-markdown-token';
import { computedAsync, throttledSignal } from './utils/signal-utils';

/**
 * Component to display markdown text
 * @experimental
 */
@Component({
  selector: 'si-markdown',
  imports: [NgComponentOutlet, SiMarkdownTemplateDirective, SiMarkdownFragmentComponent],
  templateUrl: './si-markdown.component.html',
  providers: [{ provide: SI_MARKDOWN_CONTROL, useExisting: SiMarkdownComponent }]
})
export class SiMarkdownComponent implements SiMarkdownControl {
  /**
   * The markdown text to transform and display
   * @defaultValue ''
   */
  readonly markdown = input('');
  /**
   * Options to control rendering. Can be shared across multiple instances.
   */
  readonly options = input<SiMarkdownOptions>();
  /**
   * Debug mode. When true, unknown node types will be displayed along with the node
   * as JSON.
   * @defaultValue false
   */
  readonly debug = input(false);

  protected readonly tree = throttledSignal(
    computedAsync({
      params: () => ({ markdown: this.markdown(), processor: this.config().processor }),
      computation: params => this.parseMarkdown(params.markdown, params.processor),
      initial: undefined
    }),
    50
  );

  protected readonly templateQuery = viewChildren(SiMarkdownTemplateDirective);
  protected readonly customTemplateQuery = contentChildren(SiMarkdownTemplateDirective);

  /** @internal */
  readonly templates = computed(() => {
    const map = new Map<string, TemplateRef<any>>();
    for (const template of this.templateQuery()) {
      map.set(template.nodeType(), template.template);
    }
    for (const template of this.customTemplateQuery()) {
      map.set(template.nodeType(), template.template);
    }
    return map;
  });

  private readonly actualOptions = computed(() => this.options() ?? new SiMarkdownOptions());
  protected readonly config = computed(() => {
    const options = this.actualOptions();
    return {
      processor: options.makeProcessor(),
      typeHandlers: options.getTypeHandlers(),
      codeTypeHandlers: options.getCodeTypeHandlers()
    };
  });

  private async parseMarkdown(md: string, processor: Processor<Root>): Promise<Node | undefined> {
    if (!md) {
      return undefined;
    }
    const parsed = processor.parse(md);
    return await processor.run(parsed);
  }
}
