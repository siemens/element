/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getCachedOrCreateElement } from './markdown-renderer-helpers';

const CACHE_SIZE = 100;

export type MarkdownRendererOptions = Record<string, never>;

interface ProcessOptions {
  allowCodeBlocks?: boolean;
  allowBlockquotes?: boolean;
  allowTables?: boolean;
  allowInlineCode?: boolean;
  allowLinks?: boolean;
}

/**
 * Returns a function that transforms markdown text into a formatted HTML node.
 *
 * **Important for SSR**: When using this function in an SSR context, you must provide the `doc` and `isBrowser` parameters.
 * Call this within an Angular injection context and pass `inject(DOCUMENT)` and `isPlatformBrowser(inject(PLATFORM_ID))`.
 *
 * @experimental
 * @param sanitizer - Angular DomSanitizer instance
 * @param options - Optional configuration for the markdown renderer
 * @param doc - Document instance (optional for browser-only apps, required for SSR - pass inject(DOCUMENT))
 * @param isBrowser - Whether running in browser (optional for browser-only apps, required for SSR - pass isPlatformBrowser(inject(PLATFORM_ID)))
 * @returns A function taking the markdown text to transform and returning a DOM div element containing the formatted HTML
 */
export const getMarkdownRenderer = (
  sanitizer: DomSanitizer,
  options?: MarkdownRendererOptions,
  doc?: Document,
  isBrowser?: boolean
): ((text: string) => Node) => {
  // Use provided document or fall back to global document for backwards compatibility
  const docRef = doc ?? document;
  const isInBrowser = isBrowser ?? true;

  // Persistent caches within this renderer instance
  const codeBlockCache = new Map<string, HTMLElement>();
  const tableCache = new Map<string, HTMLElement>();
  const codeBlockCacheOrder: string[] = [];
  const tableCacheOrder: string[] = [];

  // Placeholder maps for cached elements
  const codeBlockPlaceholderMap = new Map<string, string>();
  const tablePlaceholderMap = new Map<string, string>();

  // Placeholder maps for inline elements
  const linkPlaceholderMap = new Map<string, { text: string; url: string }>();

  /**
   * Main recursive processing function
   */
  const processMarkdown = (
    text: string,
    processOpts: ProcessOptions = {
      allowCodeBlocks: true,
      allowBlockquotes: true,
      allowTables: true,
      allowInlineCode: true,
      allowLinks: true
    }
  ): string => {
    let result = text;

    // Step 1: Extract and process code blocks (4+ backticks for nested markdown)
    if (processOpts.allowCodeBlocks) {
      const codeBlockMap = new Map<string, string>();

      // Match code blocks with 4 or more backticks (for displaying nested code blocks)
      result = result.replace(
        /(^|\n)([\s]*)(````+)([^\n]*)\n?([\s\S]*?)\n?\s*\3/gm,
        (match, prefix, indent, backticks, language, content) => {
          const placeholder = `--CODE-BLOCK-${Math.random().toString(36).substring(2, 15)}--`;
          const cacheKey = createCodeBlockCacheKey(language.trim(), content);
          codeBlockPlaceholderMap.set(placeholder, cacheKey);
          codeBlockMap.set(placeholder, `<!--CODE-BLOCK-PLACEHOLDER-${placeholder}-->`);
          return prefix + indent + placeholder;
        }
      );

      // Match standard code blocks (3 backticks)
      // Add temporary closing marker for incomplete code blocks during streaming
      const tempResult = result + '\n```--TEMP-CLOSE--\n';
      result = tempResult.replace(
        /(^|\n)([\s]*)(```)([^\n]*)\n?([\s\S]*?)(?:\n\s*```|```$)/gm,
        (match, prefix, indent, backticks, language, content) => {
          // Skip the temp closing marker
          if (content.includes('--TEMP-CLOSE--')) {
            return match;
          }
          const placeholder = `--CODE-BLOCK-${Math.random().toString(36).substring(2, 15)}--`;
          const cacheKey = createCodeBlockCacheKey(language.trim(), content);
          codeBlockPlaceholderMap.set(placeholder, cacheKey);
          codeBlockMap.set(placeholder, `<!--CODE-BLOCK-PLACEHOLDER-${placeholder}-->`);
          return prefix + indent + placeholder;
        }
      );
      // Remove temp closing marker
      result = result.replace(/\n```--TEMP-CLOSE--\n/g, '').replace(/--TEMP-CLOSE--/g, '');

      // Restore code block placeholders
      codeBlockMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 2: Extract and process blockquotes (can contain code blocks and inline elements)
    if (processOpts.allowBlockquotes) {
      const blockquoteMap = new Map<string, string>();
      const lines = result.split('\n');
      let i = 0;

      while (i < lines.length) {
        if (lines[i].match(/^\s*>/)) {
          const blockquoteLines: string[] = [];
          while (i < lines.length && lines[i].match(/^\s*>/)) {
            blockquoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
            i++;
          }

          const blockquoteContent = blockquoteLines.join('\n');
          const processedContent = processMarkdown(blockquoteContent, {
            ...processOpts,
            allowBlockquotes: false,
            allowTables: false
          });

          const placeholder = `--BLOCKQUOTE-${Math.random().toString(36).substring(2, 15)}--`;
          blockquoteMap.set(placeholder, `<blockquote>${processedContent}</blockquote>`);
          lines.splice(i - blockquoteLines.length, blockquoteLines.length, placeholder);
          i = i - blockquoteLines.length + 1;
        } else {
          i++;
        }
      }

      result = lines.join('\n');

      blockquoteMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 3: Extract and process tables
    if (processOpts.allowTables) {
      result = processTables(result);
    }

    // Step 4: Extract and process inline code (must be before inline formatting)
    if (processOpts.allowInlineCode) {
      const inlineCodeMap = new Map<string, string>();

      result = result.replace(/(?<!\\)(?:\\\\)*`([^`]+)`/g, (match, content) => {
        const placeholder = `--INLINE-CODE-${Math.random().toString(36).substring(2, 15)}--`;
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        inlineCodeMap.set(placeholder, `<code>${escaped}</code>`);
        return placeholder;
      });

      inlineCodeMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 5: Process links (both formats, can contain inline code)
    if (processOpts.allowLinks) {
      result = result.replace(/<(https?:\/\/[^\s>]+)>/g, (match, url) => {
        const sanitizedUrl = sanitizeUrl(url, sanitizer);
        return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
      });

      // Images: ![alt](url)
      result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
        const sanitizedUrl = sanitizeUrl(url, sanitizer);
        const escapedAlt = escapeHtml(alt);
        return `<img src="${sanitizedUrl}" alt="${escapedAlt}">`;
      });

      // Links: [text](url) - keep as placeholder to protect from line breaks
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const placeholder = `--LINK-${Math.random().toString(36).substring(2, 15)}--`;
        linkPlaceholderMap.set(placeholder, { text: linkText, url });
        return placeholder;
      });

      // Auto-detect URLs
      result = result.replace(/(?<!["'=(])\b(https?:\/\/[^\s<]+[^\s<.,;!?"')\]])/g, match => {
        const sanitizedUrl = sanitizeUrl(match, sanitizer);
        return `<a class="link-text" href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(match)}</a>`;
      });
    }

    // Step 6: Process inline formatting only on text segments, not on block elements
    result = processTextSegments(result, sanitizer);

    return result;
  };

  /**
   * Create cache key for code block
   */
  const createCodeBlockCacheKey = (language: string, content: string): string => {
    return `${language}|||${content}`;
  };

  /**
   * Create a code block element (cached)
   */
  const createCodeBlockElement = (language: string, content: string): HTMLElement => {
    const cacheKey = createCodeBlockCacheKey(language, content);

    return getCachedOrCreateElement(
      codeBlockCache,
      codeBlockCacheOrder,
      CACHE_SIZE,
      cacheKey,
      () => {
        // Escape HTML for code blocks
        const displayContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Sanitize the display content
        const sanitized = sanitizer.sanitize(SecurityContext.HTML, displayContent) ?? '';

        const languageLabel = language
          ? `<span class="code-language">${escapeHtml(language)}</span>`
          : '';
        const headerContent = languageLabel
          ? `<div class="code-header">${languageLabel}</div>`
          : '';
        const wrapperClass = headerContent ? 'code-wrapper has-header' : 'code-wrapper';
        return `<div class="${wrapperClass}">${headerContent}<pre><code>${sanitized}</code></pre></div>`;
      },
      docRef
    );
  };

  /**
   * Process tables
   */
  const processTables = (input: string): string => {
    const lines = input.split('\n');
    const tableMap = new Map<string, string>();
    let i = 0;

    while (i < lines.length) {
      if (lines[i].match(/^\|.+/)) {
        const tableLines: string[] = [];
        let hasSeparator = false;

        while (i < lines.length && lines[i].match(/^\|.+/)) {
          const line = lines[i];
          if (line.match(/^\|\s*[-:]+/)) {
            hasSeparator = true;
          } else {
            tableLines.push(line);
          }
          i++;
        }

        if (tableLines.length > 0) {
          const placeholder = `--TABLE-${Math.random().toString(36).substring(2, 15)}--`;
          tablePlaceholderMap.set(placeholder, JSON.stringify({ hasSeparator, tableLines }));
          tableMap.set(placeholder, `<!--TABLE-PLACEHOLDER-${placeholder}-->`);

          lines.splice(
            i - tableLines.length - (hasSeparator ? 1 : 0),
            tableLines.length + (hasSeparator ? 1 : 0),
            placeholder
          );
          i = i - tableLines.length - (hasSeparator ? 1 : 0) + 1;
        }
      } else {
        i++;
      }
    }

    let result = lines.join('\n');

    tableMap.forEach((html, placeholder) => {
      result = result.replace(placeholder, html);
    });

    return result;
  };

  /**
   * Create cache key for table
   */
  const createTableCacheKey = (tableLines: string[], hasSeparator: boolean): string => {
    return `${tableLines.join('|||')}|||${hasSeparator}`;
  };

  /**
   * Create table HTML element (cached)
   */
  const createTableElement = (tableLines: string[], hasSeparator: boolean): HTMLElement => {
    const cacheKey = createTableCacheKey(tableLines, hasSeparator);

    return getCachedOrCreateElement(
      tableCache,
      tableCacheOrder,
      CACHE_SIZE,
      cacheKey,
      () => {
        const rows: string[] = [];

        tableLines.forEach((line, rowIndex) => {
          if (!line.trim()) {
            return;
          }

          const escapedPipePlaceholder = `___ESCAPED_PIPE___${Math.random().toString(36).substring(2, 15)}___`;
          const contentWithPlaceholders = line.replace(/\\\|/g, escapedPipePlaceholder);
          const parts = contentWithPlaceholders.split('|');
          const cells = parts.slice(1, -1);

          const processedCells = cells.map(cell => {
            let originalCell = cell.replace(new RegExp(escapedPipePlaceholder, 'g'), '|').trim();

            // Extract inline code to protect <br> tags within code
            const inlineCodeMap = new Map<string, string>();
            originalCell = originalCell.replace(
              /(?<!\\)(?:\\\\)*`([^`]+)`/g,
              (match, codeContent) => {
                const inlinePlaceholder = `___INLINE_CODE_${Math.random().toString(36).substring(2, 15)}___`;
                inlineCodeMap.set(inlinePlaceholder, match);
                return inlinePlaceholder;
              }
            );

            // Convert <br> tags to newlines for table cells (outside of code)
            originalCell = originalCell.replace(/<br\s*\/?>/gi, '\n');

            // Restore inline code
            inlineCodeMap.forEach((code, inlinePlaceholder) => {
              originalCell = originalCell.replace(inlinePlaceholder, code);
            });

            // Process cell content for inline elements
            return processMarkdown(originalCell, {
              allowCodeBlocks: false,
              allowBlockquotes: false,
              allowTables: false,
              allowInlineCode: true,
              allowLinks: true
            });
          });

          const isHeader = hasSeparator && rowIndex === 0;
          const tag = isHeader ? 'th' : 'td';
          const rowHtml = `<tr>${processedCells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
          rows.push(rowHtml);
        });

        // Filter out empty rows
        const filteredRows = rows.filter(row => {
          const tempTable = docRef.createElement('table');
          tempTable.innerHTML = `<tbody>${row}</tbody>`;
          const tableCells = tempTable.querySelectorAll('td, th');
          return Array.from(tableCells).some(cell => {
            const hasText = !!cell.textContent?.trim();
            const hasHtml = !!cell.innerHTML?.trim();
            return hasText || hasHtml;
          });
        });

        if (filteredRows.length === 0) {
          return '<div></div>';
        }

        let tableHtml = '<table class="table table-hover">';

        if (hasSeparator && filteredRows.length > 0) {
          tableHtml += '<thead>' + filteredRows[0] + '</thead>';
          if (filteredRows.length > 1) {
            tableHtml += '<tbody>' + filteredRows.slice(1).join('') + '</tbody>';
          }
        } else {
          tableHtml += '<tbody>' + filteredRows.join('') + '</tbody>';
        }

        tableHtml += '</table>';

        return `<div class="table-wrapper"><div class="table-scroll-container">${tableHtml}</div></div>`;
      },
      docRef
    );
  };

  /**
   * Process text segments separately from block elements
   */
  const processTextSegments = (input: string, domSanitizer: DomSanitizer): string => {
    const blockElementRegex =
      /(<(pre|blockquote|ul|ol|hr|h[1-6]|table)[^>]*>[\s\S]*?<\/\2>)|(<!--(?:CODE-BLOCK|TABLE|BLOCKQUOTE)-PLACEHOLDER-[^>]+-->)/g;

    const parts: string[] = [];
    let lastIndex = 0;
    let blockMatch;

    while ((blockMatch = blockElementRegex.exec(input)) !== null) {
      if (blockMatch.index > lastIndex) {
        parts.push(input.slice(lastIndex, blockMatch.index));
      }
      parts.push(blockMatch[0]);
      lastIndex = blockMatch.index + blockMatch[0].length;
    }
    if (lastIndex < input.length) {
      parts.push(input.slice(lastIndex));
    }

    const processedParts = parts.map(part => {
      if (part.match(/^<(pre|blockquote|ul|ol|hr|h[1-6]|table)|^<!--/)) {
        return part;
      }
      return processInlineFormatting(part, domSanitizer);
    });

    let result = processedParts.join('');

    // Restore links
    linkPlaceholderMap.forEach((linkData, placeholder) => {
      const sanitizedUrl = sanitizeUrl(linkData.url, sanitizer);
      let linkText = linkData.text;

      // Process inline code in link text
      linkText = linkText.replace(/(?<!\\)(?:\\\\)*`([^`]+)`/g, (match, content) => {
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<code>${escaped}</code>`;
      });

      const sanitizedText = domSanitizer.sanitize(SecurityContext.HTML, linkText) ?? '';
      const linkHtml = `<a class="link-text" href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${sanitizedText}</a>`;
      result = result.replace(placeholder, linkHtml);
    });

    return result;
  };

  /**
   * Process inline formatting (headings, bold, italic, lists, etc.) on plain text
   */
  const processInlineFormatting = (input: string, domSanitizer: DomSanitizer): string => {
    let result = input;

    // Preserve escaped characters
    result = result.replace(/\\\*/g, '___ESCAPED_ASTERISK___');
    result = result.replace(/\\_/g, '___ESCAPED_UNDERSCORE___');

    // Headings
    result = result.replace(/^###### (.+)$/gm, '<strong>$1</strong>');
    result = result.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    result = result.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    result = result.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    result = result.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    result = result.replace(/^# (.+)$/gm, '<h2><strong>$1</strong></h2>');

    // Horizontal rule
    result = result.replace(/^---+$/gm, '<hr>');

    // Bold and italic
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result = result.replace(/_(.+?)_/g, '<em>$1</em>');

    // Lists
    result = result.replace(/^[•\-*] (.+)$/gm, '<li class="unordered">$1</li>');
    result = result.replace(/^&#8226; (.+)$/gm, '<li class="unordered">$1</li>');
    result = result.replace(/^\d+\. (.+)$/gm, '<li class="ordered">$1</li>');

    // Wrap lists (remove whitespace between items)
    result = result.replace(
      /(<li class="ordered">.*?<\/li>)\s*\n\s*(?=<li class="ordered">)/gs,
      '$1'
    );
    result = result.replace(
      /(<li class="unordered">.*?<\/li>)\s*\n\s*(?=<li class="unordered">)/gs,
      '$1'
    );

    result = result.replace(
      /(<li class="ordered">.*?<\/li>(?:<li class="ordered">.*?<\/li>)*)/gs,
      '<ol>$1</ol>'
    );
    result = result.replace(
      /(<li class="unordered">.*?<\/li>(?:<li class="unordered">.*?<\/li>)*)/gs,
      '<ul>$1</ul>'
    );

    result = result.replace(/ class="ordered"/g, '');
    result = result.replace(/ class="unordered"/g, '');

    // Paragraphs
    const paragraphPlaceholder = '___PARAGRAPH_BREAK___';
    const segments = result.split(/\n{2,}/g);

    result = segments
      .map(segment => {
        const trimmed = segment.trim();
        if (!trimmed) {
          return '';
        }
        if (/^\s*<(h[1-6]|pre|blockquote|ul|ol|hr|div|code|li|p)/.test(trimmed)) {
          return segment.replace(/\n/g, paragraphPlaceholder);
        }

        const withoutTags = trimmed.replace(/<[^>]*>/g, '').trim();
        if (!withoutTags) {
          return '';
        }

        return '<p>' + segment + '</p>';
      })
      .filter(segment => segment !== '')
      .join(paragraphPlaceholder)
      .replace(/\n/g, '<br>')
      .replace(new RegExp(paragraphPlaceholder, 'g'), ' ');

    // Restore escaped characters
    result = result.replace(/___ESCAPED_ASTERISK___/g, '*');
    result = result.replace(/___ESCAPED_UNDERSCORE___/g, '_');

    const sanitized = domSanitizer.sanitize(SecurityContext.HTML, result);
    return sanitized ?? '';
  };

  /**
   * Main render function
   */
  return (text: string): HTMLElement => {
    const div = docRef.createElement('div');
    div.className = 'markdown-content text-break';

    if (text === null || text === undefined) {
      return div;
    }

    const processedHtml = processMarkdown(text);
    div.innerHTML = processedHtml;

    // Replace comment placeholders with cached elements
    const commentsToReplace: { comment: Comment; element: HTMLElement }[] = [];

    if (isInBrowser) {
      const walker = docRef.createTreeWalker(div, NodeFilter.SHOW_COMMENT);

      let currentNode = walker.nextNode();
      while (currentNode) {
        const comment = currentNode as Comment;

        // Handle code block placeholders
        const codeMatch = comment.textContent?.match(/CODE-BLOCK-PLACEHOLDER-(.*)/);
        if (codeMatch) {
          const placeholderId = codeMatch[1];
          const cacheKey = codeBlockPlaceholderMap.get(placeholderId);
          if (cacheKey) {
            const keyParts = cacheKey.split('|||');
            const language = keyParts[0];
            const content = keyParts[1];
            const cachedElement = createCodeBlockElement(language, content);
            if (cachedElement) {
              commentsToReplace.push({ comment, element: cachedElement });
            }
          }
        }

        // Handle table placeholders
        const tableMatch = comment.textContent?.match(/TABLE-PLACEHOLDER-(.*)/);
        if (tableMatch) {
          const placeholderId = tableMatch[1];
          const tableDataJson = tablePlaceholderMap.get(placeholderId);
          if (tableDataJson) {
            try {
              const { hasSeparator, tableLines } = JSON.parse(tableDataJson);
              const cachedElement = createTableElement(tableLines, hasSeparator);
              if (cachedElement) {
                commentsToReplace.push({ comment, element: cachedElement });
              }
            } catch (e) {
              console.warn('Failed to parse table placeholder data', e);
            }
          }
        }

        currentNode = walker.nextNode();
      }
    }

    commentsToReplace.forEach(({ comment, element }) => {
      if (comment.parentNode && element) {
        comment.parentNode.replaceChild(element.cloneNode(true), comment);
      }
    });

    return div;
  };
};

/**
 * Sanitize URL to prevent XSS attacks
 */
const sanitizeUrl = (url: string, sanitizer: DomSanitizer): string => {
  url = url.trim();
  const allowed = /^(https?:\/\/|mailto:|\/(?!\/)|\.{1,2}\/|#)/i;

  if (!allowed.test(url)) {
    return '#';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.URL, url);
  return sanitized ?? '#';
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
