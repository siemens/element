/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiMarkdownContentComponent } from '@siemens/element-ng/chat-messages';

@Component({
  selector: 'app-sample',
  imports: [SiMarkdownContentComponent],
  templateUrl: './si-markdown-content.html'
})
export class SampleComponent {
  markdownContent = `# AI Assistant Response

Here's a **comprehensive example** of markdown content with various formatting options.

This is a separate paragraph that demonstrates how double line breaks create proper paragraph spacing.

## Code Examples

You can use inline code like \`console.log('Hello World')\` or multi-line code blocks:

\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log(\`Result: \${result}\`);
\`\`\`

## Formatting Options

Here's a paragraph explaining the formatting options available.

Another paragraph with different formatting elements:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` for technical terms

## Lists and Bullets

Here are the key features:

• Multi-line code blocks with syntax preservation
• Bold and italic text formatting
• Inline code highlighting
- Bullet point lists
- Blockquote support

This paragraph appears after the list to show proper spacing.

## Ordered Lists

Step-by-step instructions:

1. First, analyze the requirements
2. Then, implement the solution
3. Finally, test the implementation

> This is a blockquote that demonstrates how quoted text appears in the markdown content component.

This paragraph follows the blockquotes to demonstrate proper paragraph separation.

This is a separate paragraph created by double line breaks.

- Unordered item
- Another item

Another paragraph between the lists.

1. First ordered item
2. Second ordered item

Final paragraph to show proper spacing.

## Tables

Tables are also supported:

| Feature | Examples | Status | Notes |
|---------|----------|--------|-------|
| **Basic content** | Alice Johnson<br>Bob Smith | ✓ Complete | Simple text and line breaks |
| *Formatting* | **Bold** and *italic*<br>Plus \`code\` and<br>\`\`\`multiline code\`\`\` | ✓ Complete | Multiple markdown formats |
| Lists in cells | - First item<br>- Second item<br>- Third item | ✓ Complete | Bullet lists work properly |
| Escaped pipes | grep "text\\|pattern"<br>awk '{print $1\\|$2}' | ✓ Complete | Use \\| for literal pipes |
| Line breaks | Line 1<br>Line 2<br>Line 3 | ✓ Complete | Uses \`<br>\` tags |

This paragraph appears after the tables to demonstrate proper spacing.`;
}
