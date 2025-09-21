/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'si-markdown-content',
  imports: [CommonModule],
  templateUrl: './si-markdown-content.component.html',
  styleUrl: './si-markdown-content.component.scss'
})
export class SiMarkdownContentComponent {
  private sanitizer = inject(DomSanitizer);

  /**
   * The markdown content to transform and display
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Computed property that transforms the markdown content into safe HTML
   */
  protected readonly sanitizedHtml = computed(() => {
    const value = this.content();
    return this.transformMarkdown(value);
  });

  private transformMarkdown(value: string): SafeHtml {
    if (!value || typeof value !== 'string') return '';

    // Generate a random placeholder for newlines to preserve them during HTML sanitization
    const newlinePlaceholder = `__NEWLINE_${Math.random().toString(36).substring(2, 15)}__`;

    // Replace newlines with placeholder before sanitization
    const valueWithPlaceholders = value.replace(/\n/g, newlinePlaceholder);

    // Sanitize the input using Angular's HTML sanitizer
    const sanitizedInput =
      this.sanitizer.sanitize(SecurityContext.HTML, valueWithPlaceholders) ?? '';

    // Restore newlines from placeholder for markdown processing.
    let html = sanitizedInput.replace(new RegExp(newlinePlaceholder, 'g'), '\n');

    // Generate a random placeholder for inner code blocks to prevent markdown processing inside them
    const innerCodeQuotePlaceholder = `__INNER_CODE_${Math.random().toString(36).substring(2, 15)}__`;

    // Apply markdown transformations to the sanitized content
    html = html
      // Multiline code blocks ```code```
      .replace(/```[^\n]*\n?([\s\S]*?)\n?```/g, (match, content) => {
        // Escape HTML special characters in code blocks (not for security, but for correct display) and preserve inner backticks
        return `<pre><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, innerCodeQuotePlaceholder)}</code></pre>`;
      })

      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Inline code `text`
      .replace(/`(.*?)`/g, (match, content) => {
        // Escape HTML special characters in inline code (not for security, but for correct display)
        return `<code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
      })

      // Headings #, ##, ###, etc.
      .replace(/^###### (.*$)/gm, '<strong>$1</strong>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h3>')
      .replace(/^# (.*$)/gm, '<h2><strong>$1</strong></h2>')

      // Restore inner code block placeholders
      .replace(new RegExp(innerCodeQuotePlaceholder, 'g'), '`');

    html = html
      // Bullet points - handle each type separately (• gets converted to &#8226; by sanitizer)
      .replace(/^&#8226; (.*$)/gm, '<li class="unordered">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="unordered">$1</li>')

      // Ordered list items (1., 2., 3., etc.)
      .replace(/^\d+\. (.*$)/gm, '<li class="ordered">$1</li>');

    html = html.replace(/^\s*(?:>|&gt;)\s*(.*)$/gm, '<blockquote>$1</blockquote>');

    html = html
      // Wrap ordered lists
      .replace(/(<li class="ordered">.*?<\/li>)/gs, '<ol>$1</ol>')

      // Wrap unordered lists
      .replace(/(<li class="unordered">.*?<\/li>)/gs, '<ul>$1</ul>')

      // Remove duplicate ol/ul tags
      .replace(/<\/ol>\s*<ol>/g, '')
      .replace(/<\/ul>\s*<ul>/g, '')

      // Clean up class attributes
      .replace(/ class="ordered"/g, '')
      .replace(/ class="unordered"/g, '')

      // Convert double newlines to paragraphs (before single line breaks)
      .split(/\n{2}/g)
      // Wrap non-block elements in <p> tags
      .map(segment => {
        // If the segment starts with a block element, return as is
        if (!segment.trim() || /^\s*<(h[1-6]|pre|blockquote|ul|ol)/.test(segment.trim())) {
          // Replace newlines inside blocks with the placeholder
          return segment.replace(/\n/g, newlinePlaceholder);
        }
        // Otherwise, wrap in <p> tags
        return `<p>${segment}</p>`;
      })
      // Use newline placeholder again so as not to replace newlines between blocks
      .join(newlinePlaceholder)
      // Convert remaining newlines to line breaks (do this LAST)
      .replace(/\n/g, '<br>')
      // Restore newline placeholders
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n');

    // Bypass Angular's security to allow the generated HTML (already sanitized)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
