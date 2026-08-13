/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { type Node, type Parent, type Table } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-table',
  imports: [SiMarkdownFragmentComponent],
  templateUrl: './si-markdown-table.component.html'
})
export class SiMarkdownTableComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<any>();
  protected readonly table = computed(() => this.node() as Table);
}
