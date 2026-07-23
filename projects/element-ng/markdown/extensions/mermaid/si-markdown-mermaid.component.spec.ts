/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { siMarkdownMermaid } from './si-markdown-mermaid.extension';

describe('SiMarkdownMermaidComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders a Mermaid fenced code block when the extension is installed', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().installExtension(siMarkdownMermaid())
    );
    fixture.componentRef.setInput('markdown', '```mermaid\ngraph TD\n  Start --> End\n```');
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(element.querySelector('si-markdown-mermaid svg')).not.toBeNull();
    });

    const mermaid = element.querySelector('si-markdown-mermaid');

    expect(mermaid).not.toBeNull();
    expect(mermaid?.querySelector('svg')).toHaveTextContent(/Start.*End/);
    expect(element.querySelector('si-markdown-code')).toBeNull();
  });
});
