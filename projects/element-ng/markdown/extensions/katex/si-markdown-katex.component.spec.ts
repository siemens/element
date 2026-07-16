/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { siMarkdownMathKaTeX } from './si-markdown-katex.extension';

describe('SiMarkdownKatexComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('renders inline and display math when the KaTeX extension is installed', async () => {
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().installExtension(siMarkdownMathKaTeX())
    );
    fixture.componentRef.setInput('markdown', 'Inline math: $x^2$.\n\n$$\ny^2\n$$');
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const inlineMath = element.querySelector('si-markdown-katex:not(.d-block)');
    const displayMath = element.querySelector('si-markdown-katex.d-block');

    expect(inlineMath).not.toBeNull();
    expect(inlineMath!).not.toHaveClass('d-block');
    expect(inlineMath?.querySelector('.katex-html')).toHaveTextContent('x2');
    expect(displayMath).not.toBeNull();
    expect(displayMath!).toHaveClass('d-block');
    expect(displayMath?.querySelector('.katex-html')).toHaveTextContent('y2');
  });
});
