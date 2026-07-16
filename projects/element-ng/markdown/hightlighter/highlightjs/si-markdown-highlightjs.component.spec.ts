/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { siMarkdownHighlightJs } from './si-markdown-highlightjs.highlighter';

describe('SiMarkdownHightlightJsComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('highlights a fenced code block when configured as the code highlighter', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().setCodeHighlighter(siMarkdownHighlightJs())
    );
    fixture.componentRef.setInput('markdown', '```typescript\nconst answer = 42;\n```');
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(element.querySelector('si-markdown-highlightjs .hljs-keyword')).not.toBeNull();
    });

    const codeBlock = element.querySelector('si-markdown-code');
    const highlighter = codeBlock?.querySelector('si-markdown-highlightjs');

    expect(codeBlock).not.toBeNull();
    expect(codeBlock?.querySelector('.code-language')).toHaveTextContent('TypeScript');
    expect(highlighter).not.toBeNull();
    expect(highlighter?.querySelector('pre code')).toHaveTextContent('const answer = 42;');
    expect(highlighter?.querySelector('.hljs-keyword')).toHaveTextContent('const');
  });

  it('loads a Python language definition before highlighting a code block', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().setCodeHighlighter(siMarkdownHighlightJs())
    );
    fixture.componentRef.setInput('markdown', '```python\ndef greet():\n    return "Hello"\n```');
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(element.querySelector('si-markdown-highlightjs .hljs-keyword')).not.toBeNull();
    });

    const codeBlock = element.querySelector('si-markdown-code');
    const highlighter = codeBlock?.querySelector('si-markdown-highlightjs');

    expect(codeBlock?.querySelector('.code-language')).toHaveTextContent('Python');
    expect(highlighter?.querySelector('pre code')).toHaveTextContent('def greet(): return "Hello"');
    expect(highlighter?.querySelector('.hljs-keyword')).toHaveTextContent('def');
  });

  it('detects the language of an unlabeled fenced code block when enabled', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().setCodeHighlighter(
        siMarkdownHighlightJs({ autoDetectLanguage: true })
      )
    );
    fixture.componentRef.setInput('markdown', '```\ninterface User { name: string; }\n```');
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));

    await vi.waitFor(() => {
      expect(element.querySelector('.code-language')).toHaveTextContent('TypeScript');
    });

    const highlighter = element.querySelector('si-markdown-highlightjs');

    expect(highlighter?.querySelector('pre code')).toHaveTextContent(
      'interface User { name: string; }'
    );
    expect(highlighter?.querySelector('.hljs-keyword')).toHaveTextContent('interface');
  });
});
