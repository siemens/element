/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownRendererComponent as TestComponent } from './si-markdown-renderer.component';

describe('SiMarkdownRendererComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let hostElement: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    hostElement = fixture.nativeElement;
  });

  it('should render empty content for null/undefined input', () => {
    fixture.componentRef.setInput('text', null);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toBe('');
  });

  it('should render plain text without transformation', () => {
    const plainText = 'This is plain text';
    fixture.componentRef.setInput('text', plainText);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain(plainText);
  });

  it('should transform bold markdown **text**', () => {
    fixture.componentRef.setInput('text', 'This is **bold** text');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const strongElement = markdownDiv.querySelector('strong')!;
    expect(strongElement.textContent).toBe('bold');
  });

  it('should transform italic markdown *text*', () => {
    fixture.componentRef.setInput('text', 'This is *italic* text');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const emElement = markdownDiv.querySelector('em')!;
    expect(emElement.textContent).toBe('italic');
  });

  it('should transform inline code `text`', () => {
    fixture.componentRef.setInput('text', 'This is `code_` text');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;
    expect(codeElement.textContent).toBe('code_');
  });

  it('should transform code blocks ```code```', () => {
    fixture.componentRef.setInput('text', '```\nconst x = 1;\n```');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const preElement = markdownDiv.querySelector('pre')!;
    const codeElement = preElement.querySelector('code')!;
    expect(codeElement.textContent).toContain('const x = 1;');
  });

  it('should transform bullet points to lists (• character)', () => {
    fixture.componentRef.setInput('text', '• First item\n• Second item');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should transform bullet points to lists (- character)', () => {
    fixture.componentRef.setInput('text', '- First item\n- Second item');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should convert newlines to line breaks', () => {
    fixture.componentRef.setInput('text', 'Line 1\nLine 2');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const brElements = markdownDiv.querySelectorAll('br');
    expect(brElements.length).toBe(1);
  });

  it('should handle complex markdown with multiple elements', () => {
    const complexMarkdown = `This is **bold** text with _italic_, escaped \\_ and \\* and \`code\`.

• First item
• Second item

\`\`\`
const example = "code block";
\`\`\``;

    fixture.componentRef.setInput('text', complexMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    // Check for transformed markdown in the HTML string
    expect(innerHTML).toContain('<strong>bold</strong>');
    expect(innerHTML).toContain('<em>italic</em>');
    expect(innerHTML).toContain('<code>code</code>');
    const codeWrapper = markdownDiv.querySelector('.code-wrapper')!;
    expect(codeWrapper).toBeTruthy();
    expect(codeWrapper.querySelector('button.copy-code-btn')).toBeTruthy();
    const preElement = codeWrapper.querySelector('pre')!;
    expect(preElement).toBeTruthy();
    expect(preElement.querySelector('code')).toBeTruthy();
    expect(innerHTML).toContain('<li>First item</li>');
  });

  it('should sanitize potentially dangerous HTML', () => {
    fixture.componentRef.setInput('text', '<script>alert("xss")</script>Safe text');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    // Script tags should be completely removed by Angular's sanitizer
    expect(innerHTML).not.toContain('<script>');
    expect(innerHTML).not.toContain('alert("xss")');
    expect(markdownDiv.textContent?.trim()).toBe('Safe text');
  });

  it('should sanitize other dangerous HTML elements', () => {
    const dangerousContent =
      '<img src="x" onerror="alert(1)">Text<iframe src="javascript:alert(1)"></iframe>';
    fixture.componentRef.setInput('text', dangerousContent);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    // Event handlers and javascript: URLs should be removed
    expect(innerHTML).not.toContain('onerror=');
    expect(innerHTML).not.toContain('javascript:');
    expect(innerHTML).not.toContain('<iframe');
    expect(markdownDiv.textContent?.trim()).toBe('Text');
  });

  it('should preserve safe HTML elements while sanitizing dangerous attributes', () => {
    fixture.componentRef.setInput('text', '<div onclick="alert(1)">Safe div</div>');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    // onclick should be removed but div element should remain
    expect(innerHTML).not.toContain('onclick=');
    expect(innerHTML).toContain('Safe div');
  });

  it('should transform markdown tables', () => {
    const tableMarkdown = `| Name | Role |
|------|------|
| Alice | Developer |
| Bob | Designer |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const tableElement = markdownDiv.querySelector('table')!;
    const trElements = markdownDiv.querySelectorAll('tr');
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tableElement).toBeTruthy();
    expect(tableElement.classList).toContain('table');
    expect(tableElement.classList).toContain('table-hover');
    expect(trElements.length).toBe(3); // Header + 2 data rows
    expect(tdElements.length).toBe(6); // 2 columns × 3 rows
    expect(tdElements[0].textContent?.trim()).toBe('Name');
    expect(tdElements[1].textContent?.trim()).toBe('Role');
    expect(tdElements[2].textContent?.trim()).toBe('Alice');
    expect(tdElements[3].textContent?.trim()).toBe('Developer');
  });

  it('should escape HTML in table cells', () => {
    const tableMarkdown = `| Name | Code |
|------|------|
| <script>alert('xss')</script> | <b>Bold</b> |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tdElements[2].innerHTML).not.toContain('<script>');
    expect(tdElements[2].textContent).toBe('');
    expect(tdElements[3].innerHTML).toContain('<b>Bold</b>');
  });

  it('should handle tables with markdown formatting inside cells', () => {
    const tableMarkdown = `| Feature | Status |
|---------|--------|
| **Bold** | *Italic* |
| \`Code\` | Normal |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<strong>Bold</strong>');
    expect(innerHTML).toContain('<em>Italic</em>');
    expect(innerHTML).toContain('<code>Code</code>');
  });

  it('should handle escaped pipe characters in tables', () => {
    const tableMarkdown = `| Command | Description |
|---------|-------------|
| grep "text\\|pattern" | Search for text OR pattern |
| awk '{print $1\\|$2}' | Print fields separated by pipe |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tdElements[2].textContent?.trim()).toBe('grep "text|pattern"');
    expect(tdElements[3].textContent?.trim()).toBe('Search for text OR pattern');
    expect(tdElements[4].textContent?.trim()).toBe("awk '{print $1|$2}'");
    expect(tdElements[5].textContent?.trim()).toBe('Print fields separated by pipe');
  });

  it('should handle lists and line breaks inside table cells', () => {
    const tableMarkdown = `| Feature | Examples |
|---------|----------|
| **Lists** | - First item<br>- Second item<br>- Third item |
| *Line breaks* | Line 1<br>Line 2<br>Line 3 |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;
    const tdElements = markdownDiv.querySelectorAll('td');

    // Check that formatting is preserved
    expect(innerHTML).toContain('<strong>Lists</strong>');
    expect(innerHTML).toContain('<em>Line breaks</em>');

    // Check that lists are properly formatted
    expect(tdElements[3].innerHTML).toContain('<ul>');
    expect(tdElements[3].innerHTML).toContain('<li>First item</li>');
    expect(tdElements[3].innerHTML).toContain('<li>Second item</li>');
    expect(tdElements[3].innerHTML).toContain('<li>Third item</li>');

    // Check that line breaks work in cells - <br> tags remain as <br> in innerHTML, don't convert to \n in textContent
    expect(tdElements[5].innerHTML).toContain('<br>');
    expect(tdElements[5].textContent).toBe('Line 1Line 2Line 3');
  });

  it('should update content when input changes', () => {
    fixture.componentRef.setInput('text', 'First content');
    fixture.detectChanges();

    let markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('First content');

    fixture.componentRef.setInput('text', 'Updated **content**');
    fixture.detectChanges();

    markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('Updated content');
    expect(markdownDiv.querySelector('strong')).toBeTruthy();
  });
});
