/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** @experimental */
@Component({
  selector: 'si-markdown-content',
  imports: [CommonModule],
  template: `<div class="markdown-content text-break" [innerHTML]="sanitizedHtml()"></div>`,
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

    // Process tables first
    html = html
      // Remove table separator lines first
      .replace(/^\|\s*[-:]+.*\|\s*$/gm, '')
      // Process table rows
      .replace(/^\|(.+)\|\s*$/gm, (match, content) => {
        // Handle escaped pipes by temporarily replacing them
        const escapedPipePlaceholder = `__ESCAPED_PIPE_${Math.random().toString(36).substring(2, 15)}__`;
        const contentWithPlaceholders = content.replace(/\\\|/g, escapedPipePlaceholder);
        const cells = contentWithPlaceholders.split('|').map((cell: string) => {
          const trimmedCell = cell.trim();
          // Restore escaped pipes
          const cellWithPipes = trimmedCell.replace(new RegExp(escapedPipePlaceholder, 'g'), '|');

          return cellWithPipes;
        });
        // Make cell ready for markdown processing by replacing code blocks with inline code and <br> with newlines
        const cellsWithNewlines = cells.map((cell: string) => {
          // Replace multiline code blocks with single line code blocks
          const cellWithoutMultilineCode = cell.replace(
            /```([\s\S]*?)```/g,
            (_match, inlineCodeContent) => {
              return '`' + inlineCodeContent.replace(/`/g, '') + '`';
            }
          );
          // Temporarily replace single line code blocks to avoid replacing <br> inside them
          const tableInlineCodeBrPlaceholder = `__INLINE_CODE_BR_${Math.random().toString(36).substring(2, 15)}__`;
          const cellWithPlaceholders = cellWithoutMultilineCode.replace(
            /(`[^`]*`)/g,
            inlineCodeMatch => {
              return inlineCodeMatch.replace(/<br>/g, tableInlineCodeBrPlaceholder);
            }
          );
          // Replace <br> with newlines
          const cellWithNewlines = cellWithPlaceholders.replace(/<br\s*\/?>/gi, '\n');
          // Restore <br> in inline code placeholders
          const preProcessedCell = cellWithNewlines.replace(
            new RegExp(tableInlineCodeBrPlaceholder, 'g'),
            '<br>'
          );
          return preProcessedCell;
        });

        // Recursively process cell content for markdown formatting
        const processedCells = cellsWithNewlines.map((cell: string) => {
          return this.transformMarkdownContent(cell, false);
        });

        return `<tr>${processedCells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`;
      })
      // Wrap table rows in table elements
      .replace(/(<tr>.*?<\/tr>)/gs, '<table class="table table-hover">$1</table>')
      // Remove duplicate table tags
      .replace(/<\/table>\s*<table class="table table-hover">/g, '');

    html = this.transformMarkdownContent(html);

    // Bypass Angular's security to allow the generated HTML (already sanitized)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private transformMarkdownContent(html: string, keepAdditionalNewlines = true): string {
    // Generate a random placeholder for inner code blocks to prevent markdown processing inside them
    const innerCodeQuotePlaceholder = `__INNER_CODE_${Math.random().toString(36).substring(2, 15)}__`;
    const codeSectionPlaceholderMap = new Map<string, string>();

    // Apply markdown transformations to the sanitized content
    html = html
      // Multiline code blocks ```code``` with placeholder
      .replace(/```[^\n]*\n?([\s\S]*?)\n?```/g, (match, content) => {
        // Escape HTML special characters in code blocks (not for security, but for correct display) and preserve inner backticks
        const code = `<pre><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, innerCodeQuotePlaceholder)}</code></pre>`;
        const codePlaceholder = `__CODE_BLOCK_${Math.random().toString(36).substring(2, 15)}__`;
        codeSectionPlaceholderMap.set(codePlaceholder, code);
        return codePlaceholder;
      })

      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
        const sanitizedUrl = this.sanitizeUrl(url);
        return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      })

      // Auto-detect URLs and convert to links
      .replace(/(?<!["'=(])\b(https?:\/\/[^\s<]+[^\s<.,;!?"')\]])/g, match => {
        const sanitizedUrl = this.sanitizeUrl(match);
        return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      })

      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Inline code `text`
      .replace(/`(.*?)`/g, (match, content) => {
        // Escape HTML special characters in inline code (not for security, but for correct display)
        const code = `<code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
        const codePlaceholder = `__INLINE_CODE_${Math.random().toString(36).substring(2, 15)}__`;
        codeSectionPlaceholderMap.set(codePlaceholder, code);
        return codePlaceholder;
      })

      // Headings #, ##, ###, etc.
      .replace(/^###### (.*$)/gm, '<strong>$1</strong>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h2><strong>$1</strong></h2>');

    html = html
      // Bullet points - handle each type separately (• gets converted to &#8226; by sanitizer)
      .replace(/^&#8226; (.*$)/gm, '<li class="unordered">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="unordered">$1</li>')

      // Ordered list items (1., 2., 3., etc.)
      .replace(/^\d+\. (.*$)/gm, '<li class="ordered">$1</li>');

    html = html.replace(/^\s*(?:>|&gt;)\s*(.*)$/gm, '<blockquote>$1</blockquote>');

    // Generate a random placeholder for newlines to differentiate them from those used for paragraphs
    const finalNewlinePlaceholder = `__NEWLINE_${Math.random().toString(36).substring(2, 15)}__`;

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
      .replace(/ class="unordered"/g, '');

    html = html
      // Convert double newlines to paragraphs (before single line breaks)
      .split(/\n{2}/g)
      // Wrap non-block elements in <p> tags
      .map(segment => {
        // If the segment starts with a block element, return as is
        if (!segment.trim() || /^\s*<(h[1-6]|pre|blockquote|ul|ol)/.test(segment.trim())) {
          // Replace newlines inside blocks with the placeholder
          return segment.replace(/\n/g, finalNewlinePlaceholder);
        }
        // Otherwise, wrap in <p> tags
        return `<p>${segment}</p>`;
      })
      // Use newline placeholder again so as not to replace newlines between blocks
      .join(finalNewlinePlaceholder)
      // Convert remaining newlines to line breaks (do this LAST)
      .replace(/\n/g, '<br>')
      // Restore newline placeholders
      .replace(new RegExp(finalNewlinePlaceholder, 'g'), keepAdditionalNewlines ? '\n' : ' ');

    // Restore code placeholders
    codeSectionPlaceholderMap.forEach((code, placeholder) => {
      html = html.replace(new RegExp(placeholder, 'g'), code);
    });

    // Restore inner code block placeholders
    html = html.replace(new RegExp(innerCodeQuotePlaceholder, 'g'), '`');

    return html;
  }

  /**
   * Sanitizes a URL to prevent XSS attacks
   * @param url - The URL to sanitize
   * @returns The sanitized URL or '#' if invalid
   */
  private sanitizeUrl(url: string): string {
    // Remove any whitespace
    url = url.trim();

    // Allow only http, https, and mailto protocols
    const allowedProtocols = /^(https?:\/\/|mailto:)/i;

    if (!allowedProtocols.test(url)) {
      return '#';
    }

    // Sanitize the URL using Angular's sanitizer
    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, url);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return sanitized || '#';
  }
}
