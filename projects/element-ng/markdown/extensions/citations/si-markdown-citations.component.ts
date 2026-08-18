/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import {
  SI_MARKDOWN_CONTROL,
  type Citations,
  type SiMarkdownCitation,
  type SiMarkdownExtensionComponent
} from '@siemens/element-ng/markdown';
import { SiSourceChipComponent } from '@siemens/element-ng/source-chip';
import { type Node, type Parent } from 'mdast';

@Component({
  selector: 'si-markdown-citations',
  imports: [SiSourceChipComponent],
  template: `
    <si-source-chip compact [sources]="sources()" (sourceClicked)="citationClicked($event)" />
  `
})
export class SiMarkdownCitationsComponent implements SiMarkdownExtensionComponent {
  protected readonly control = inject(SI_MARKDOWN_CONTROL);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();

  readonly options = input<any>();

  protected readonly sources = computed(() => {
    const citationNode = this.node() as Citations;
    const ret: SiMarkdownCitation[] = [];
    const citations = this.control.meta().citations ?? [];
    for (const cit of citationNode.children) {
      if (cit.citationIndex < citations.length) {
        ret.push(citations[cit.citationIndex]);
      }
    }
    return ret;
  });

  protected citationClicked(cit: SiMarkdownCitation): void {
    this.control.extensionEvent.emit({ name: 'citationClicked', data: cit });
  }
}
