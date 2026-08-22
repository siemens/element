/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { makeSiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { siMarkdownTabsetDirective } from './si-markdown-tabset.register';

describe('Markdown tabset/tab directives', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    fixture.componentRef.setInput(
      'options',
      makeSiMarkdownOptions().registerDirective(siMarkdownTabsetDirective())
    );
    element = fixture.nativeElement;
  });

  it('renders tabs with their heading and content', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `::::tabset
:::tab{heading="First tab" disabled=true}
First tab content.
:::

:::tab{heading="Second tab"}
Second tab content.
:::
::::`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const tabs = element.querySelectorAll<HTMLElement>('si-tab');

    expect(element.querySelector('si-tabset')).toBeInTheDocument();
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('First tab');
    expect(tabs[0]).not.toHaveClass('disabled');

    tabs[0].click();
    await fixture.whenStable();

    expect(element.querySelector('.tab-content')).toHaveTextContent('First tab content.');
  });
});
