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
  let latexRendererFn: WritableSignal<
    ((latex: string, displayMode: boolean) => string | undefined) | undefined
  >;

  beforeEach(() => {
    text = signal('');
    latexRendererFn = signal(undefined);
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('text', text), inputBinding('latexRenderer', latexRendererFn)]
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
    expect(brElements.length).toBe(1);
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
    expect(codeWrapper.querySelector('button.copy-code-btn')).toBeTruthy();
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
    expect(trElements.length).toBe(3);
    expect(thElements.length).toBe(2);
    expect(tdElements.length).toBe(4);
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

  it('should render LaTeX inline math expressions with provided renderer', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex">E=mc^2</span>');

    latexRendererFn.set(latexRenderer);
    text.set('The formula is $E = mc^2$ in physics.');
    await fixture.whenStable();

    expect(latexRenderer).toHaveBeenCalledWith('E = mc^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<span class="katex">E=mc^2</span>');
  });

  it('should render LaTeX display math expressions with provided renderer', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex-display">integral</span>');

    latexRendererFn.set(latexRenderer);
    text.set('$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx$$');
    await fixture.whenStable();

    expect(latexRenderer).toHaveBeenCalledWith('\\int_{-\\infty}^{\\infty} e^{-x^2} dx', true);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<div class="latex-display-wrapper">');
    expect(markdownDiv.innerHTML).toContain('<span class="katex-display">integral</span>');
  });

  it('should not render LaTeX when no renderer is provided', async () => {
    text.set('The formula is $E = mc^2$ in physics.');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$E = mc^2$');
  });

  it('should handle multiple inline LaTeX expressions', async () => {
    const latexRenderer = vi
      .fn()
      .mockImplementation((latex: string) => `<span class="katex">${latex}</span>`);

    latexRendererFn.set(latexRenderer);
    text.set('First $x^2$ and second $y^3$ formulas.');
    await fixture.whenStable();

    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);
    expect(latexRenderer).toHaveBeenCalledWith('y^3', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<span class="katex">x^2</span>');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">y^3</span>');
  });

  it('should not treat $$ as inline math', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span>rendered</span>');

    latexRendererFn.set(latexRenderer);
    text.set('$$x^2$$');
    await fixture.whenStable();

    // Should be called with displayMode true, not as inline
    expect(latexRenderer).toHaveBeenCalledWith('x^2', true);
    expect(latexRenderer).not.toHaveBeenCalledWith('x^2', false);
  });

  it('should handle LaTeX rendering errors gracefully', async () => {
    const latexRenderer = vi.fn().mockImplementation(() => {
      throw new Error('Parse error');
    });

    latexRendererFn.set(latexRenderer);
    text.set('Formula: $E = mc^2$');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    // Should fall back to original text
    expect(markdownDiv.textContent).toContain('$E = mc^2$');
  });

  it('should render LaTeX inside markdown with other formatting', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex">formula</span>');

    latexRendererFn.set(latexRenderer);
    text.set('This is **bold** with $x^2$ formula and `code`.');
    await fixture.whenStable();

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.innerHTML).toContain('<strong>bold</strong>');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
    expect(markdownDiv.innerHTML).toContain('<code>code</code>');
  });

  it('should not treat dollar signs in code blocks as LaTeX', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex">formula</span>');

    const markdownText = 'Formula: $x^2$\n\n```javascript\nconst price = "$100";\n```';
    latexRendererFn.set(latexRenderer);
    text.set(markdownText);
    await fixture.whenStable();

    // LaTeX renderer should only be called for the inline math, not the code block
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    const codeElement = markdownDiv.querySelector('code')!;
    expect(codeElement.textContent).toContain('$100');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
  });

  it('should handle LaTeX and code blocks together in complex markdown', async () => {
    const latexRenderer = vi
      .fn()
      .mockImplementation((latex: string, displayMode: boolean) =>
        displayMode
          ? '<div class="katex-display">display</div>'
          : '<span class="katex">inline</span>'
      );

    const markdownText = `Inline: $a^2$

$$\\sum_{i=1}^{n} i$$

\`\`\`python
cost = 50  # $50 per item
print(f"Total: \${cost}")
\`\`\`

After: $b^2$`;

    latexRendererFn.set(latexRenderer);
    text.set(markdownText);
    await fixture.whenStable();

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

  it('should not treat escaped dollar signs as LaTeX delimiters', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex">formula</span>');

    latexRendererFn.set(latexRenderer);
    text.set('The price is \\$100 and formula is $x^2$.');
    await fixture.whenStable();

    // Should only be called for the actual LaTeX, not the escaped dollar
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$100');
    expect(markdownDiv.innerHTML).toContain('<span class="katex">formula</span>');
  });

  it('should handle multiple escaped dollar signs', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span class="katex">formula</span>');

    latexRendererFn.set(latexRenderer);
    text.set('Prices: \\$50, \\$100, \\$150 with math $a + b$.');
    await fixture.whenStable();

    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('a + b', false);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$50');
    expect(markdownDiv.textContent).toContain('$100');
    expect(markdownDiv.textContent).toContain('$150');
  });

  it('should not treat escaped $$ as display LaTeX', async () => {
    const latexRenderer = vi.fn().mockReturnValue('<span>rendered</span>');

    latexRendererFn.set(latexRenderer);
    text.set('Not math: \\$\\$ but this is: $$x^2$$');
    await fixture.whenStable();

    // Should only be called for the actual display math
    expect(latexRenderer).toHaveBeenCalledTimes(1);
    expect(latexRenderer).toHaveBeenCalledWith('x^2', true);

    const markdownDiv = hostElement.firstElementChild!;
    expect(markdownDiv.textContent).toContain('$$');
  });
});
