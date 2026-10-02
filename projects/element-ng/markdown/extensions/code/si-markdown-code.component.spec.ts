/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from '../../si-markdown.component';

describe('SiMarkdownCodeComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;
  let realSetTimeout: typeof setTimeout;

  beforeEach(() => {
    vi.useRealTimers();
    realSetTimeout = globalThis.setTimeout;
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a fenced code block without a highlighter', async () => {
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    await fixture.whenStable();
    await new Promise(resolve => realSetTimeout(resolve));
    await fixture.whenStable();

    const codeBlock = element.querySelector('si-markdown-code');

    expect(codeBlock).not.toBeNull();
    expect(codeBlock).toHaveClass('d-flex', 'flex-column');
    expect(codeBlock?.querySelector('.code-language')).toHaveTextContent('typescript');
    expect(codeBlock?.querySelector('pre code')).toHaveTextContent('const answer = 42;');
  });

  it('shows a copied confirmation for 1.5 seconds after copying the code block content', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    await fixture.whenStable();
    await new Promise(resolve => realSetTimeout(resolve));
    await fixture.whenStable();

    const copyButton = element.querySelector('si-markdown-code button') as HTMLButtonElement;
    copyButton.click();
    await Promise.resolve();
    fixture.detectChanges();

    const copied = element.querySelector<HTMLElement>('si-markdown-code .copied');
    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(copied).toHaveTextContent('Copied');

    await new Promise(resolve => realSetTimeout(resolve, 1500));
    fixture.detectChanges();

    const restoredCopyButton = element.querySelector('si-markdown-code button');

    expect(restoredCopyButton).toHaveAccessibleName('Copy code');
  });

  it('cancels the copied confirmation timeout when destroyed', async () => {
    const clearTimeout = vi.spyOn(globalThis, 'clearTimeout');
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    await fixture.whenStable();
    await new Promise(resolve => realSetTimeout(resolve));
    await fixture.whenStable();

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    const copyButton = element.querySelector('si-markdown-code button') as HTMLButtonElement;
    copyButton.click();
    await Promise.resolve();
    const copyTimeout = setTimeoutSpy.mock.results.at(-1)?.value;

    fixture.destroy();

    expect(clearTimeout).toHaveBeenCalledWith(copyTimeout);
  });
});
