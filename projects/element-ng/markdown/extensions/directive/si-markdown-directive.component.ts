/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgComponentOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { type Node, type Parent } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import {
  type TypeHandler,
  type DirectiveNode,
  type SiMarkdownExtensionComponent
} from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-directive',
  imports: [NgComponentOutlet, SiMarkdownFragmentComponent],
  template: `
    @let component = directiveComponent();
    @if (component) {
      <ng-container
        [ngComponentOutlet]="component"
        [ngComponentOutletInputs]="{ node: node(), parent: parent() }"
      />
    } @else {
      <div [siMarkdownFragment]="node()"></div>
    }
  `
})
export class SiMarkdownDirectiveComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<ReadonlyMap<string, TypeHandler>>();

  protected readonly directiveComponent = computed(() => {
    const directive = this.node() as DirectiveNode;
    return this.options()?.get(directive.name)?.component;
  });
}
