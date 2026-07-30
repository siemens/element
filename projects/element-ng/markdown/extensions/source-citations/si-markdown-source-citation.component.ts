/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { SiPopoverBodyDirective, SiPopoverDirective, SiPopoverTitleDirective } from '@siemens/element-ng/popover';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';
import { type Node, type Parent } from 'mdast';

import { SiMarkdownExtensionComponent } from '../../si-markdown.types';
import type {
  SiMarkdownCitation,
  SiMarkdownSourceCitationNode,
  SiMarkdownSourceCitationsOptions
} from './si-markdown-source-citation.extension';

@Component({
  selector: 'si-markdown-source-citation',
  imports: [
    SiPopoverBodyDirective,
    SiPopoverDirective,
    SiPopoverTitleDirective,
    SiSummaryChipComponent
  ],
  templateUrl: './si-markdown-source-citation.component.html',
  styleUrl: './si-markdown-source-citation.component.scss'
})
export class SiMarkdownSourceCitationComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<SiMarkdownSourceCitationsOptions>();

  protected readonly citations = computed(
    () => (this.node() as SiMarkdownSourceCitationNode).citations
  );
  protected readonly label = computed(() => {
    const citations = this.citations();
    const [firstCitation] = citations;
    return citations.length > 1 ? `${firstCitation.name} +${citations.length - 1}` : firstCitation.name;
  });
  protected readonly triggerLabel = computed(() => {
    const citations = this.citations();
    const [firstCitation] = citations;
    const additionalSources = citations.length - 1;
    return additionalSources > 0
      ? `View sources: ${firstCitation.name} and ${additionalSources} additional source${
          additionalSources === 1 ? '' : 's'
        }`
      : `View source: ${firstCitation.name}`;
  });

  protected openSource(citation: SiMarkdownCitation): void {
    this.options()?.onSourceOpen?.(citation);
  }
}