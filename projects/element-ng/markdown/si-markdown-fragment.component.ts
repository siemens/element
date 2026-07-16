/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { type Node, type Parent } from 'mdast';

import { SI_MARKDOWN_CONTROL } from './si-markdown-token';

/**
 * Renders a fragment of markdown based on the children of a single node in the AST.
 */
@Component({
  selector: 'si-markdown-fragment, [siMarkdownFragment]',
  imports: [NgTemplateOutlet, JsonPipe],
  templateUrl: './si-markdown-fragment.component.html',
  host: {
    class: 'markdown-content'
  }
})
export class SiMarkdownFragmentComponent {
  protected readonly control = inject(SI_MARKDOWN_CONTROL);
  /** The node for which to render all children */
  readonly node = input.required<Node>({ alias: 'siMarkdownFragment' });
  /** all the children of the node */
  readonly children = computed(() => (this.node() as Parent).children ?? []);
}
