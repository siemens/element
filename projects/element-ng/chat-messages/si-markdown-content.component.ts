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
  standalone: true,
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

    // Restore newlines from placeholder temporarily for markdown processing.
    let html = sanitizedInput.replace(new RegExp(newlinePlaceholder, 'g'), '\n');

    // Apply markdown transformations to the sanitized content
    html = html
      // Multiline code blocks ```code```
      .replace(/```[^\n]*\n?([\s\S]*?)\n?```/g, '<pre><code>$1</code></pre>')

      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Inline code `text`
      .replace(/`(.*?)`/g, '<code>$1</code>');

    html = html
      // Bullet points - handle each type separately (• gets converted to &#8226; by sanitizer)
      .replace(/^&#8226; (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>');

    html = html.replace(/^\s*(?:>|&gt;)\s*(.*)$/gm, '<blockquote>$1</blockquote>');

    html = html
      // Wrap lists
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')

      // Remove duplicate ul tags
      .replace(/<\/ul>\s*<ul>/g, '')

      // Convert newlines to line breaks (do this LAST)
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
