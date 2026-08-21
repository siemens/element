/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type Node, type Parent } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { type SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-custom-directive',
  imports: [SiMarkdownFragmentComponent],
  template: '<div class="custom-directive" [siMarkdownFragment]="node()"></div>'
})
class CustomDirectiveComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<unknown>();
}

describe('SiMarkdownDirectiveComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders components registered for custom directives', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().registerDirective({
        type: 'custom',
        component: CustomDirectiveComponent
      })
    );
    fixture.componentRef.setInput('markdown', ':::custom\nCustom content.\n:::');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(element.querySelector('.custom-directive')).toHaveTextContent('Custom content.');
  });

  it('renders the content of unhandled directives as Markdown', async () => {
    fixture.componentRef.setInput('markdown', ':::unknown\n**Fallback content.**\n:::');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(element.querySelector('strong')).toHaveTextContent('Fallback content.');
  });
});
