/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { elementDocument } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { type Link, type Node, type Parent } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-link',
  imports: [SiIconComponent, SiMarkdownFragmentComponent],
  templateUrl: './si-markdown-link.component.html',
  styles: `
    :host {
      vertical-align: middle;
    }
  `
})
export class SiMarkdownLinkComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<any>();

  protected readonly icons = addIcons({ elementDocument });
  protected readonly link = computed(() => this.node() as Link);
  protected readonly fileUrl = computed(() => {
    try {
      const url = new URL(this.link().url);
      return url.protocol === 'file:' ? url : undefined;
    } catch {
      return undefined;
    }
  });
  protected readonly isFileLink = computed(() => this.fileUrl() !== undefined);
  protected readonly filename = computed(() => {
    const path = this.fileUrl()?.pathname ?? '';
    return decodeURIComponent(path).split('/').at(-1) ?? '';
  });
  protected readonly hasLabel = computed(() => this.link().children.length > 0);
}
