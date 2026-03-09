/**
 * Copyright (c) Siemens 2016 - 2026
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
    const thElements = markdownDiv.querySelectorAll('th');
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tableElement).toBeTruthy();
    expect(tableElement.classList).toContain('table');
    expect(tableElement.classList).toContain('table-hover');
    expect(trElements.length).toBe(3); // Header + 2 data rows
    expect(thElements.length).toBe(2); // 2 header cells
    expect(tdElements.length).toBe(4); // 2 columns × 2 data rows
    expect(thElements[0].textContent?.trim()).toBe('Name');
    expect(thElements[1].textContent?.trim()).toBe('Role');
    expect(tdElements[0].textContent?.trim()).toBe('Alice');
    expect(tdElements[1].textContent?.trim()).toBe('Developer');
    expect(tdElements[2].textContent?.trim()).toBe('Bob');
    expect(tdElements[3].textContent?.trim()).toBe('Designer');
  });

  it('should escape HTML in table cells', () => {
    const tableMarkdown = `| Name | Code |
|------|------|
| <script>alert('xss')</script> | <b>Bold</b> |`;

    fixture.componentRef.setInput('text', tableMarkdown);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    const tdElements = markdownDiv.querySelectorAll('td');

    expect(tdElements[0].innerHTML).not.toContain('<script>');
    expect(tdElements[0].textContent).toBe('');
    expect(tdElements[1].innerHTML).toContain('<b>Bold</b>');
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

    expect(tdElements[0].textContent?.trim()).toBe('grep "text|pattern"');
    expect(tdElements[1].textContent?.trim()).toBe('Search for text OR pattern');
    expect(tdElements[2].textContent?.trim()).toBe("awk '{print $1|$2}'");
    expect(tdElements[3].textContent?.trim()).toBe('Print fields separated by pipe');
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
    expect(tdElements[1].innerHTML).toContain('<ul>');
    expect(tdElements[1].innerHTML).toContain('<li>First item</li>');
    expect(tdElements[1].innerHTML).toContain('<li>Second item</li>');
    expect(tdElements[1].innerHTML).toContain('<li>Third item</li>');

    // Check that line breaks work in cells - <br> tags remain as <br> in innerHTML, don't convert to \n in textContent
    expect(tdElements[3].innerHTML).toContain('<br>');
    expect(tdElements[3].textContent).toBe('Line 1Line 2Line 3');
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

  it('should render LaTeX inline math expressions with provided renderer', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex">E=mc^2</span>');

    fixture.componentRef.setInput('text', 'The formula is $E = mc^2$ in physics.');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    expect(latexRenderer).toHaveBeenCalledWith('E = mc^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<span class="katex">E=mc^2</span>');
  });

  it('should render LaTeX display math expressions with provided renderer', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex-display">integral</span>');

    fixture.componentRef.setInput('text', '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx$$');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    expect(latexRenderer).toHaveBeenCalledWith('\\int_{-\\infty}^{\\infty} e^{-x^2} dx', true);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<div class="latex-display-wrapper">');
    expect(markdownDiv.innerHTML).toContain('<span class="katex-display">integral</span>');
  });

  it('should not render LaTeX when no renderer is provided', () => {
    fixture.componentRef.setInput('text', 'The formula is $E = mc^2$ in physics.');
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$E = mc^2$');
  });

  it('should handle multiple inline LaTeX expressions', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.callFake((latex: string) => `<span class="katex">${latex}</span>`);

    fixture.componentRef.setInput('text', 'First $x^2$ and second $y^3$ formulas.');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);
    expect(latexRenderer).toHaveBeenCalledWith('y^3', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<span class="katex">x^2</span>');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">y^3</span>');
  });

  it('should not treat $$ as inline math', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span>rendered</span>');

    fixture.componentRef.setInput('text', '$$x^2$$');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    // Should be called with displayMode true, not as inline
    expect(latexRenderer).toHaveBeenCalledWith('x^2', true);
    expect(latexRenderer).not.toHaveBeenCalledWith('x^2', false);
  });

  it('should handle LaTeX rendering errors gracefully', () => {
    const latexRenderer = jasmine.createSpy('latexRenderer').and.throwError('Parse error');

    fixture.componentRef.setInput('text', 'Formula: $E = mc^2$');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    // Should fall back to original text
    expect(markdownDiv.textContent).toContain('$E = mc^2$');
  });

  it('should render LaTeX inside markdown with other formatting', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex">formula</span>');

    fixture.componentRef.setInput('text', 'This is **bold** with $x^2$ formula and `code`.');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<strong>bold</strong>');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
    expect(markdownDiv.innerHTML).toContain('<code>code</code>');
  });

  it('should not treat dollar signs in code blocks as LaTeX', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex">formula</span>');

    const text = 'Formula: $x^2$\n\n```javascript\nconst price = "$100";\n```';
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    // LaTeX renderer should only be called for the inline math, not the code block
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;
    expect(codeElement.textContent).toContain('$100');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
  });

  it('should handle LaTeX and code blocks together in complex markdown', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.callFake((latex: string, displayMode: boolean) =>
        displayMode
          ? '<div class="katex-display">display</div>'
          : '<span class="katex">inline</span>'
      );

    const text = `Inline: $a^2$

$$\\sum_{i=1}^{n} i$$

\`\`\`python
cost = 50  # $50 per item
print(f"Total: \${cost}")
\`\`\`

After: $b^2$`;

    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    // Should be called twice for inline math and once for display math
    expect(latexRenderer).toHaveBeenCalledTimes(3);
    expect(latexRenderer).toHaveBeenCalledWith('a^2', false);
    expect(latexRenderer).toHaveBeenCalledWith('\\sum_{i=1}^{n} i', true);
    expect(latexRenderer).toHaveBeenCalledWith('b^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;
    // Dollar signs in code should be preserved
    expect(codeElement.textContent).toContain('$50');
    expect(codeElement.textContent).toContain('${cost}');
    // LaTeX should be rendered
    expect(markdownDiv.innerHTML).toContain('<span class="katex">inline</span>');
    expect(markdownDiv.innerHTML).toContain('<div class="latex-display-wrapper">');
    expect(markdownDiv.innerHTML).toContain('<div class="katex-display">display</div>');
  });

  it('should not treat escaped dollar signs as LaTeX delimiters', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex">formula</span>');

    fixture.componentRef.setInput('text', 'The price is \\$100 and formula is $x^2$.');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    // Should only be called for the actual LaTeX, not the escaped dollar
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$100');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
  });

  it('should handle multiple escaped dollar signs', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span class="katex">formula</span>');

    fixture.componentRef.setInput('text', 'Prices: \\$50, \\$100, \\$150 with math $a + b$.');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('a + b', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$50');
    expect(markdownDiv.textContent).toContain('$100');
    expect(markdownDiv.textContent).toContain('$150');
  });

  it('should not treat escaped $$ as display LaTeX', () => {
    const latexRenderer = jasmine
      .createSpy('latexRenderer')
      .and.returnValue('<span>rendered</span>');

    fixture.componentRef.setInput('text', 'Not math: \\$\\$ but this is: $$x^2$$');
    fixture.componentRef.setInput('latexRenderer', latexRenderer);
    fixture.detectChanges();

    // Should only be called for the actual display math
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', true);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$$');
  });
});
