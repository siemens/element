/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from '../../si-markdown.component';

describe('SiMarkdownLinkComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders a direct link', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `[Direct](https://example.com/direct "Direct title")`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const links = element.querySelectorAll('si-markdown-link a');

    expect(element.querySelectorAll('si-markdown-link')).toHaveLength(1);
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Direct');
    expect(links[0]).toHaveAttribute('href', 'https://example.com/direct');
    expect(links[0]).toHaveAttribute('title', 'Direct title');
  });

  it('renders file links as document chips and uses the filename for empty labels', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `[Open file](file:///Users/dritz/some-file.ts#40-55)

[](file:///Users/dritz/another-file.ts#1)`
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const links = element.querySelectorAll<HTMLElement>('si-markdown-link .filename');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('Open file');
    expect(links[0]).toHaveAttribute('href', 'file:///Users/dritz/some-file.ts#40-55');
    expect(links[1]).toHaveTextContent('another-file.ts');
    expect(links[1]).toHaveAttribute('href', 'file:///Users/dritz/another-file.ts#1');
  });
});
