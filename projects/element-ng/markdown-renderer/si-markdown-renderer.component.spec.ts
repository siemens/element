/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownRendererComponent as TestComponent } from './si-markdown-renderer.component';

describe('SiMarkdownRendererComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let hostElement: HTMLElement;
  let text: WritableSignal<string | null>;

  beforeEach(() => {
    text = signal('');
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('text', text)]
    });
    hostElement = fixture.nativeElement;
  });

  it('should render empty content for null/undefined input', async () => {
    text.set(null);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toBe('');
  });

  it('should render plain text without transformation', async () => {
    const plainText = 'This is plain text';
    text.set(plainText);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv).toHaveTextContent(plainText);
  });

  it('should transform bold markdown **text**', async () => {
    text.set('This is **bold** text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const strongElement = markdownDiv.querySelector('strong')!;
    expect(strongElement).toHaveTextContent('bold');
  });

  it('should transform italic markdown *text*', async () => {
    text.set('This is *italic* text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const emElement = markdownDiv.querySelector('em')!;
    expect(emElement).toHaveTextContent('italic');
  });

  it('should transform inline code `text`', async () => {
    text.set('This is `code_` text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;
    expect(codeElement).toHaveTextContent('code_');
  });

  it('should not transform emphasis markers inside inline code', async () => {
    text.set('This is `code_with_underscore and **bold** and a*b*c` text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;

    expect(codeElement).toHaveTextContent('code_with_underscore and **bold** and a*b*c');
    expect(codeElement.querySelector('em')).not.toBeInTheDocument();
    expect(codeElement.querySelector('strong')).not.toBeInTheDocument();
  });

  it('should keep inline code protected while transforming surrounding emphasis', async () => {
    text.set('This is **bold** `not_italic` *italic*');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;

    expect(markdownDiv.querySelector('strong')).toHaveTextContent('bold');
    expect(markdownDiv.querySelector('em')).toHaveTextContent('italic');
    expect(codeElement).toHaveTextContent('not_italic');
    expect(codeElement.querySelector('em')).not.toBeInTheDocument();
  });

  it('should protect multiple inline code snippets on one line', async () => {
    text.set('Use `first_value` and `second**value**` here');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElements = markdownDiv.querySelectorAll('code');

    expect(codeElements).toHaveLength(2);
    expect(codeElements[0]).toHaveTextContent('first_value');
    expect(codeElements[1]).toHaveTextContent('second**value**');
    expect(codeElements[1].querySelector('strong')).not.toBeInTheDocument();
  });

  it('should not auto-link URLs inside inline code', async () => {
    text.set('Use `https://example.com/path_with_underscore` here');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;

    expect(codeElement).toHaveTextContent('https://example.com/path_with_underscore');
    expect(codeElement.querySelector('a')).not.toBeInTheDocument();
  });

  it('should protect inline code in link text', async () => {
    text.set('[Use `code_with_underscore`](https://example.com)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;
    const codeElement = linkElement.querySelector('code')!;

    expect(linkElement.getAttribute('href')).toBe('https://example.com');
    expect(codeElement).toHaveTextContent('code_with_underscore');
    expect(codeElement.querySelector('em')).not.toBeInTheDocument();
  });

  it('should attribute-escape markdown link URLs', async () => {
    text.set('[link](https://example.com/" onmouseover="x)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement).not.toHaveAttribute('onmouseover');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/" onmouseover="x');
  });

  it('should preserve valid markdown link URLs with query parameters', async () => {
    text.set('[link](https://example.com/search?q=test&lang=en#results)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement.getAttribute('href')).toBe(
      'https://example.com/search?q=test&lang=en#results'
    );
  });

  it('should attribute-escape mailto link URLs', async () => {
    text.set('[mail](mailto:test@example.com" onmouseover="x)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement).not.toHaveAttribute('onmouseover');
    expect(linkElement.getAttribute('href')).toBe('mailto:test@example.com" onmouseover="x');
  });

  it('should preserve valid mailto link URLs with query parameters', async () => {
    text.set('[mail](mailto:test@example.com?subject=Hello&body=World)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement.getAttribute('href')).toBe(
      'mailto:test@example.com?subject=Hello&body=World'
    );
  });

  it('should attribute-escape auto link URLs', async () => {
    text.set('https://example.com/"onmouseover="x/path');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement).not.toHaveAttribute('onmouseover');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/"onmouseover="x/path');
  });

  it('should attribute-escape angle autolink URLs', async () => {
    text.set('<https://example.com/"onmouseover="x/path>');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('a')!;

    expect(linkElement).not.toHaveAttribute('onmouseover');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/"onmouseover="x/path');
  });

  it('should transform code blocks ```code```', async () => {
    text.set('```\nconst x = 1;\n```');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const preElement = markdownDiv.querySelector('pre')!;
    const codeElement = preElement.querySelector('code')!;
    expect(codeElement).toHaveTextContent('const x = 1;');
  });

  it('should transform bullet points to lists (\u2022 character)', async () => {
    text.set('\u2022 First item\n\u2022 Second item');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should transform bullet points to lists (- character)', async () => {
    text.set('- First item\n- Second item');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<li>First item</li>');
    expect(innerHTML).toContain('<li>Second item</li>');
    expect(innerHTML).toContain('<ul>');
  });

  it('should convert newlines to line breaks', async () => {
    text.set('Line 1\nLine 2');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const brElements = markdownDiv.querySelectorAll('br');
    expect(brElements).toHaveLength(1);
  });

  it('should handle complex markdown with multiple elements', async () => {
    const complexMarkdown = `This is **bold** text with _italic_, escaped \\_ and \\* and \`code\`.

\u2022 First item
\u2022 Second item

\`\`\`
const example = "code block";
\`\`\``;

    text.set(complexMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<strong>bold</strong>');
    expect(innerHTML).toContain('<em>italic</em>');
    expect(innerHTML).toContain('<code>code</code>');
    const codeWrapper = markdownDiv.querySelector('.code-wrapper')!;
    expect(codeWrapper).toBeTruthy();
    const preElement = codeWrapper.querySelector('pre')!;
    expect(preElement).toBeTruthy();
    expect(preElement.querySelector('code')).toBeTruthy();
    expect(innerHTML).toContain('<li>First item</li>');
  });

  it('should sanitize potentially dangerous HTML', async () => {
    text.set('<script>alert("xss")</script>Safe text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).not.toContain('<script>');
    expect(innerHTML).not.toContain('alert("xss")');
    expect(markdownDiv).toHaveTextContent('Safe text');
  });

  it('should sanitize other dangerous HTML elements', async () => {
    const dangerousContent =
      '<img src="x" onerror="alert(1)">Text<iframe src="javascript:alert(1)"></iframe>';
    text.set(dangerousContent);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).not.toContain('onerror=');
    expect(innerHTML).not.toContain('javascript:');
    expect(innerHTML).not.toContain('<iframe');
    expect(markdownDiv).toHaveTextContent('Text');
  });

  it('should preserve safe HTML elements while sanitizing dangerous attributes', async () => {
    text.set('<div onclick="alert(1)">Safe div</div>');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).not.toContain('onclick=');
    expect(innerHTML).toContain('Safe div');
  });

  it('should transform markdown tables', async () => {
    const tableMarkdown = `| Name | Role |
|------|------|
| Alice | Developer |
| Bob | Designer |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const tableElement = markdownDiv.querySelector('table')!;
    const trElements = markdownDiv.querySelectorAll('tr');
    const thElements = markdownDiv.querySelectorAll('th');
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tableElement).toBeTruthy();
    expect(tableElement).toHaveClass('table');
    expect(tableElement).toHaveClass('table-hover');
    expect(trElements).toHaveLength(3);
    expect(thElements).toHaveLength(2);
    expect(tdElements).toHaveLength(4);
    expect(thElements[0]).toHaveTextContent('Name');
    expect(thElements[1]).toHaveTextContent('Role');
    expect(tdElements[0]).toHaveTextContent('Alice');
    expect(tdElements[1]).toHaveTextContent('Developer');
    expect(tdElements[2]).toHaveTextContent('Bob');
    expect(tdElements[3]).toHaveTextContent('Designer');
  });

  it('should escape HTML in table cells', async () => {
    const tableMarkdown = `| Name | Code |
|------|------|
| <script>alert('xss')</script> | <b>Bold</b> |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tdElements[0].innerHTML).not.toContain('<script>');
    expect(tdElements[0].textContent).toBe('');
    expect(tdElements[1].innerHTML).toContain('<b>Bold</b>');
  });

  it('should handle tables with markdown formatting inside cells', async () => {
    const tableMarkdown = `| Feature | Status |
|---------|--------|
| **Bold** | *Italic* |
| \`Code\` | Normal |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;

    expect(innerHTML).toContain('<strong>Bold</strong>');
    expect(innerHTML).toContain('<em>Italic</em>');
    expect(innerHTML).toContain('<code>Code</code>');
  });

  it('should protect inline code in table cells', async () => {
    const tableMarkdown = `| Feature | Code |
|---------|------|
| **Bold** | \`code_with_underscore and **bold**\` |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('td code')!;

    expect(codeElement).toHaveTextContent('code_with_underscore and **bold**');
    expect(codeElement.querySelector('em')).not.toBeInTheDocument();
    expect(codeElement.querySelector('strong')).not.toBeInTheDocument();
  });

  it('should attribute-escape markdown link URLs in table cells', async () => {
    const tableMarkdown = `| Link |
|------|
| [link](https://example.com/" onmouseover="x) |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const linkElement = markdownDiv.querySelector('td a')!;

    expect(linkElement).not.toHaveAttribute('onmouseover');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/" onmouseover="x');
  });

  it('should handle escaped pipe characters in tables', async () => {
    const tableMarkdown = `| Command | Description |
|---------|-------------|
| grep "text\\|pattern" | Search for text OR pattern |
| awk '{print $1\\|$2}' | Print fields separated by pipe |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tdElements[0]).toHaveTextContent('grep "text|pattern"');
    expect(tdElements[1]).toHaveTextContent('Search for text OR pattern');
    expect(tdElements[2]).toHaveTextContent("awk '{print $1|$2}'");
    expect(tdElements[3]).toHaveTextContent('Print fields separated by pipe');
  });

  it('should handle lists and line breaks inside table cells', async () => {
    const tableMarkdown = `| Feature | Examples |
|---------|----------|
| **Lists** | - First item<br>- Second item<br>- Third item |
| *Line breaks* | Line 1<br>Line 2<br>Line 3 |`;

    text.set(tableMarkdown);
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const innerHTML = markdownDiv.innerHTML;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(innerHTML).toContain('<strong>Lists</strong>');
    expect(innerHTML).toContain('<em>Line breaks</em>');

    expect(tdElements[1].innerHTML).toContain('<ul>');
    expect(tdElements[1].innerHTML).toContain('<li>First item</li>');
    expect(tdElements[1].innerHTML).toContain('<li>Second item</li>');
    expect(tdElements[1].innerHTML).toContain('<li>Third item</li>');

    expect(tdElements[3].innerHTML).toContain('<br>');
    expect(tdElements[3]).toHaveTextContent('Line 1Line 2Line 3');
  });

  it('should render images from markdown', async () => {
    text.set('![alt text](https://example.com/image.png)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const imgElement = markdownDiv.querySelector('img')!;

    expect(imgElement).toBeTruthy();
    expect(imgElement.getAttribute('src')).toBe('https://example.com/image.png');
    expect(imgElement.getAttribute('alt')).toBe('alt text');
  });

  it('should attribute-escape image URLs', async () => {
    text.set('![alt](https://example.com/"onerror="x/path)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const imgElement = markdownDiv.querySelector('img')!;

    expect(imgElement).not.toHaveAttribute('onerror');
    expect(imgElement.getAttribute('src')).toBe('https://example.com/"onerror="x/path');
  });

  it('should preserve valid image URLs with query parameters', async () => {
    text.set('![alt](https://example.com/image.png?size=small&theme=dark#preview)');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const imgElement = markdownDiv.querySelector('img')!;

    expect(imgElement.getAttribute('src')).toBe(
      'https://example.com/image.png?size=small&theme=dark#preview'
    );
  });

  it('should render images alongside text', async () => {
    text.set('Some text ![logo](https://example.com/logo.png) more text');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    const imgElement = markdownDiv.querySelector('img')!;

    expect(imgElement).toBeTruthy();
    expect(imgElement.getAttribute('src')).toBe('https://example.com/logo.png');
    expect(markdownDiv).toHaveTextContent('Some text');
    expect(markdownDiv).toHaveTextContent('more text');
  });

  it('should update content when input changes', async () => {
    text.set('First content');
    await fixture.whenStable();

    let markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv).toHaveTextContent('First content');

    text.set('Updated **content**');
    await fixture.whenStable();

    markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv).toHaveTextContent('Updated content');
    expect(markdownDiv.querySelector('strong')).toBeInTheDocument();
  });
});
