/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from '../../si-markdown.component';

describe('SiMarkdownCodeComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders a fenced code block without a highlighter', async () => {
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const codeBlock = element.querySelector('si-markdown-code');

    expect(codeBlock).not.toBeNull();
    expect(codeBlock).toHaveClass('d-flex', 'flex-column');
    expect(codeBlock?.querySelector('.code-language')).toHaveTextContent('typescript');
    expect(codeBlock?.querySelector('pre code')).toHaveTextContent('const answer = 42;');
  });

  it('shows a copied confirmation for 1.5 seconds after copying the code block content', async () => {
    vi.useFakeTimers();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    await fixture.whenStable();

    const copyButton = element.querySelector('si-markdown-code button') as HTMLButtonElement;
    copyButton.click();
    await Promise.resolve();
    fixture.detectChanges();

    const copied = element.querySelector<HTMLElement>('si-markdown-code .copied');
    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(copied).toHaveTextContent('Copied');
    expect(copied?.querySelector('si-icon')).toHaveAttribute('icon', 'elementOk');

    await vi.advanceTimersByTimeAsync(1500);
    fixture.detectChanges();

    expect(copyButton).toHaveTextContent('Copy code');
  });
});
