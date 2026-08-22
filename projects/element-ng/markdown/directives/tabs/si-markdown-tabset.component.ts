/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import {
  type DirectiveNode,
  type SiMarkdownExtensionComponent,
  SiMarkdownFragmentComponent
} from '@siemens/element-ng/markdown';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { type Node, type Parent } from 'mdast';

@Component({
  selector: 'si-markdown-tabset',
  imports: [SiMarkdownFragmentComponent, SiTabComponent, SiTabsetComponent],
  template: `
    <si-tabset class="border rounded" [contentOverflowAuto]="height() !== 'auto'">
      @for (tab of tabs(); track $index) {
        <si-tab [heading]="tab.attributes.heading ?? ''" [active]="$first">
          <div class="p-6" [siMarkdownFragment]="tab"></div>
        </si-tab>
      }
    </si-tabset>
  `,
  styles: `
    si-tabset {
      block-size: var(--si-md-tabset-height, 250px);
    }
  `,
  host: {
    // note: not setting style directly on si-tabset for CSP reasons
    '[style.--si-md-tabset-height]': 'height()'
  }
})
export class SiMarkdownTabsetComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<unknown>();

  readonly height = computed(() => {
    const directive = this.node() as DirectiveNode;
    return directive.attributes.height;
  });

  protected readonly tabs = computed(() => {
    const directive = this.node() as DirectiveNode;
    const children = directive.children as unknown as DirectiveNode[];
    return children.filter(child => child.type === 'containerDirective' && child.name === 'tab');
  });
}
