/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiMarkdownContentComponent as TestComponent } from './si-markdown-content.component';

describe('SiMarkdownContentComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement;
  });

  it('should render empty content for null/undefined input', () => {
    fixture.componentRef.setInput('content', null);
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    expect(markdownDiv.nativeElement.innerHTML).toBe('');
  });

  it('should render plain text without transformation', () => {
    const plainText = 'This is plain text';
    fixture.componentRef.setInput('content', plainText);
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    expect(markdownDiv.nativeElement.textContent).toContain(plainText);
  });

  it('should transform bold markdown **text**', () => {
    fixture.componentRef.setInput('content', 'This is **bold** text');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const strongElement = markdownDiv.query(By.css('strong'));
    expect(strongElement.nativeElement.textContent).toBe('bold');
  });

  it('should transform italic markdown *text*', () => {
    fixture.componentRef.setInput('content', 'This is *italic* text');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const emElement = markdownDiv.query(By.css('em'));
    expect(emElement.nativeElement.textContent).toBe('italic');
  });

  it('should transform inline code `text`', () => {
    fixture.componentRef.setInput('content', 'This is `code` text');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const codeElement = markdownDiv.query(By.css('code'));
    expect(codeElement.nativeElement.textContent).toBe('code');
  });

  it('should transform code blocks ```code```', () => {
    fixture.componentRef.setInput('content', '```\nconst x = 1;\n```');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const preElement = markdownDiv.query(By.css('pre'));
    const codeElement = preElement.query(By.css('code'));
    expect(codeElement.nativeElement.textContent).toContain('const x = 1;');
  });

  it('should transform bullet points to lists (• character)', () => {
    fixture.componentRef.setInput('content', '• First item\n• Second item');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should transform bullet points to lists (- character)', () => {
    fixture.componentRef.setInput('content', '- First item\n- Second item');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should convert newlines to line breaks', () => {
    fixture.componentRef.setInput('content', 'Line 1\nLine 2');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const brElements = markdownDiv.queryAll(By.css('br'));
    expect(brElements.length).toBe(1);
  });

  it('should handle complex markdown with multiple elements', () => {
    const complexMarkdown = `This is **bold** text with *italic* and \`code\`.

• First item
• Second item

\`\`\`
const example = "code block";
\`\`\``;

    fixture.componentRef.setInput('content', complexMarkdown);
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    // Check for transformed markdown in the HTML string
    expect(innerHTML).toContain('<strong>bold</strong>');
    expect(innerHTML).toContain('<em>italic</em>');
    expect(innerHTML).toContain('<code>code</code>');
    expect(innerHTML).toContain('<pre><code>');
    expect(innerHTML).toContain('<li>First item</li>');
  });

  it('should sanitize potentially dangerous HTML', () => {
    fixture.componentRef.setInput('content', '<script>alert("xss")</script>Safe text');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    // Script tags should be completely removed by Angular's sanitizer
    expect(innerHTML).not.toContain('<script>');
    expect(innerHTML).not.toContain('alert("xss")');
    expect(markdownDiv.nativeElement.textContent.trim()).toBe('Safe text');
  });

  it('should sanitize other dangerous HTML elements', () => {
    const dangerousContent =
      '<img src="x" onerror="alert(1)">Text<iframe src="javascript:alert(1)"></iframe>';
    fixture.componentRef.setInput('content', dangerousContent);
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    // Event handlers and javascript: URLs should be removed
    expect(innerHTML).not.toContain('onerror=');
    expect(innerHTML).not.toContain('javascript:');
    expect(innerHTML).not.toContain('<iframe');
    expect(markdownDiv.nativeElement.textContent.trim()).toBe('Text');
  });

  it('should preserve safe HTML elements while sanitizing dangerous attributes', () => {
    fixture.componentRef.setInput('content', '<div onclick="alert(1)">Safe div</div>');
    fixture.detectChanges();

    const markdownDiv = debugElement.query(By.css('.markdown-content'));
    const innerHTML = markdownDiv.nativeElement.innerHTML;

    // onclick should be removed but div element should remain
    expect(innerHTML).not.toContain('onclick=');
    expect(innerHTML).toContain('Safe div');
  });

  it('should update content when input changes', () => {
    fixture.componentRef.setInput('content', 'First content');
    fixture.detectChanges();

    let markdownDiv = debugElement.query(By.css('.markdown-content'));
    expect(markdownDiv.nativeElement.textContent).toContain('First content');

    fixture.componentRef.setInput('content', 'Updated **content**');
    fixture.detectChanges();

    markdownDiv = debugElement.query(By.css('.markdown-content'));
    expect(markdownDiv.nativeElement.textContent).toContain('Updated content');
    expect(markdownDiv.query(By.css('strong'))).toBeTruthy();
  });
});
