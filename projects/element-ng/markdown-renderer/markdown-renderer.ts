/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { type SiTranslateService } from '@siemens/element-translate-ng/translate';
import { type TranslatableString } from '@siemens/element-translate-ng/translate-types';

import {
  sanitizeHtmlWithStyles,
  getCachedOrCreateString,
  getCachedOrCreateElement
} from './markdown-renderer-helpers';

const CACHE_SIZE = 100;

export interface MarkdownRendererOptions {
  /**
   * Provide this to enable the copy code button functionality.
   * Label for the copy code button (will be translated internally if translateService is provided).
   */
  copyCodeButton?: TranslatableString;

  /**
   * Provide this to enable the download table button functionality.
   * Label for the download table button (will be translated internally if translateService is provided).
   */
  downloadTableButton?: TranslatableString;

  /**
   * Optional syntax highlighter function for code blocks.
   * Receives code content and optional language, returns highlighted HTML or undefined.
   */
  syntaxHighlighter?: (code: string, language?: string) => string | undefined;

  /**
   * Optional LaTeX renderer function.
   * Receives LaTeX content and display mode, returns rendered HTML or undefined.
   */
  latexRenderer?: (latex: string, displayMode: boolean) => string | undefined;

  /**
   * Synchronous translation function for button labels.
   */
  translateSync?: SiTranslateService['translateSync'];
}

interface ProcessOptions {
  allowCodeBlocks?: boolean;
  allowBlockquotes?: boolean;
  allowTables?: boolean;
  allowLatex?: boolean;
  allowInlineCode?: boolean;
  allowLinks?: boolean;
}

/**
 * Returns a function that transforms markdown text into a formatted HTML node.
 *
 * @experimental
 * @param sanitizer - Angular DomSanitizer instance
 * @param options - Optional configuration for the markdown renderer
 * @returns A function taking the markdown text to transform and returning a DOM div element containing the formatted HTML
 */
export const getMarkdownRenderer = (
  sanitizer: DomSanitizer,
  options?: MarkdownRendererOptions
): ((text: string) => Node) => {
  // Persistent caches within this renderer instance
  const codeBlockCache = new Map<string, HTMLElement>();
  const tableCache = new Map<string, HTMLElement>();
  const latexCache = new Map<string, string>();
  const codeBlockCacheOrder: string[] = [];
  const tableCacheOrder: string[] = [];
  const latexCacheOrder: string[] = [];

  // Store table data for CSV export
  const tableCellData = new Map<number, Map<number, Map<number, string>>>();
  let tableCounter = 0;

  // Placeholder maps for cached elements
  const codeBlockPlaceholderMap = new Map<string, string>();
  const tablePlaceholderMap = new Map<string, string>();

  // Placeholder maps for inline elements
  const inlineLatexPlaceholderMap = new Map<string, string>();
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
      allowLatex: true,
      allowInlineCode: true,
      allowLinks: true
    }
  ): string => {
    let result = text;

    // Step 1: Extract and process code blocks (4+ backticks for nested markdown)
    if (processOpts.allowCodeBlocks) {
      const codeBlockMap = new Map<string, string>();

      // Match code blocks with 4 or more backticks (for displaying nested code blocks)
      // Only matches at line start (after optional whitespace), not after > prefix
      result = result.replace(
        /(^|\n)([\s]*)(````+)([^\n]*)\n?([\s\S]*?)\n?\s*\3/gm,
        (match, prefix, indent, backticks, language, content) => {
          const placeholder = `--CODE-BLOCK-${Math.random().toString(36).substring(2, 15)}--`;
          // Don't process content as markdown - keep it as plain text for code display
          const cacheKey = createCodeBlockCacheKey(language.trim(), content, false);
          codeBlockPlaceholderMap.set(placeholder, cacheKey);
          codeBlockMap.set(placeholder, `<!--CODE-BLOCK-PLACEHOLDER-${placeholder}-->`);
          return prefix + indent + placeholder;
        }
      );

      // Match standard code blocks (3 backticks)
      // Only matches at line start (after optional whitespace), not after > prefix
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
          const cacheKey = createCodeBlockCacheKey(language.trim(), content, false);
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
            allowBlockquotes: false, // Prevent nested blockquotes for simplicity
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

      // Restore blockquotes
      blockquoteMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 3: Extract and process tables (can contain inline code and inline latex)
    if (processOpts.allowTables) {
      result = processTables(result, processOpts);
    }

    // Step 4: Extract and process display LaTeX (multi-line formulas)
    if (processOpts.allowLatex) {
      const latexDisplayMap = new Map<string, string>();

      result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
        const placeholder = `--LATEX-DISPLAY-${Math.random().toString(36).substring(2, 15)}--`;
        const rendered = renderLatex(latex.trim(), true);
        latexDisplayMap.set(placeholder, rendered);
        return placeholder;
      });

      // Restore display LaTeX
      latexDisplayMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 5: Extract and process inline code (must be before inline LaTeX)
    if (processOpts.allowInlineCode) {
      const inlineCodeMap = new Map<string, string>();

      // Handle escaped backticks properly (match odd number of backslashes before backtick)
      result = result.replace(/(?<!\\)(?:\\\\)*`([^`]+)`/g, (match, content) => {
        const placeholder = `--INLINE-CODE-${Math.random().toString(36).substring(2, 15)}--`;
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        inlineCodeMap.set(placeholder, `<code>${escaped}</code>`);
        return placeholder;
      });

      // Restore inline code
      inlineCodeMap.forEach((html, placeholder) => {
        result = result.replace(placeholder, html);
      });
    }

    // Step 6: Extract and process inline LaTeX (keep as placeholder to protect from line breaks)
    if (processOpts.allowLatex) {
      // Escape dollar signs (handle properly with even number of backslashes)
      result = result.replace(/(?<!\\)(?:\\\\)*\\\$/g, '___ESCAPED_DOLLAR___');

      result = result.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
        const placeholder = `--LATEX-INLINE-${Math.random().toString(36).substring(2, 15)}--`;
        inlineLatexPlaceholderMap.set(placeholder, latex.trim());
        return placeholder;
      });

      // Restore escaped dollar signs
      result = result.replace(/___ESCAPED_DOLLAR___/g, '$');
    }

    // Step 7: Process links (both formats, can contain inline code)
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
        return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(match)}</a>`;
      });
    }

    // Step 8: Process inline formatting only on text segments, not on block elements
    result = processTextSegments(result, sanitizer);

    return result;
  };

  /**
   * Create cache key for code block
   */
  const createCodeBlockCacheKey = (
    language: string,
    content: string,
    isMarkdown: boolean
  ): string => {
    return `${language}|||${content}|||${options?.copyCodeButton ?? ''}|||${isMarkdown}`;
  };

  /**
   * Create a code block element with optional syntax highlighting (cached)
   */
  const createCodeBlockElement = (
    language: string,
    content: string,
    isMarkdown: boolean
  ): HTMLElement => {
    const cacheKey = createCodeBlockCacheKey(language, content, isMarkdown);

    return getCachedOrCreateElement(
      codeBlockCache,
      codeBlockCacheOrder,
      CACHE_SIZE,
      cacheKey,
      () => {
        let displayContent = content;

        if (!isMarkdown) {
          // Escape HTML for regular code blocks
          displayContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

          // Apply syntax highlighting if available
          if (options?.syntaxHighlighter && language) {
            const highlighted = options.syntaxHighlighter(content, language);
            if (highlighted) {
              displayContent = highlighted;
            }
          }
        }

        // Sanitize the display content
        const sanitized = sanitizer.sanitize(SecurityContext.HTML, displayContent) ?? '';

        const codeId = `code-${Math.random().toString(36).substring(2, 15)}`;

        // Create copy button if enabled
        let copyButton = '';
        if (options?.copyCodeButton) {
          const translatedLabel = options.translateSync
            ? options.translateSync(options.copyCodeButton)
            : options.copyCodeButton;
          const buttonLabel = escapeHtml(translatedLabel);
          copyButton = `<button type="button" class="btn btn-circle btn-sm btn-tertiary element-copy copy-code-btn" data-code-id="${codeId}" aria-label="${buttonLabel}"></button>`;
        }

        const wrapperClass = copyButton ? 'code-wrapper has-copy-button' : 'code-wrapper';
        return `<div class="${wrapperClass}">${copyButton}<pre><code id="${codeId}">${sanitized}</code></pre></div>`;
      }
    );
  };

  /**
   * Render LaTeX formula
   */
  const renderLatex = (latex: string, displayMode: boolean): string => {
    const cacheKey = `${displayMode ? 'display' : 'inline'}|||${latex}`;

    return getCachedOrCreateString(latexCache, latexCacheOrder, CACHE_SIZE, cacheKey, () => {
      if (!options?.latexRenderer) {
        return escapeHtml(displayMode ? `$$${latex}$$` : `$${latex}$`);
      }

      let rendered: string | undefined;
      try {
        rendered = options.latexRenderer(latex, displayMode);
      } catch {
        return escapeHtml(displayMode ? `$$${latex}$$` : `$${latex}$`);
      }

      if (!rendered) {
        return escapeHtml(displayMode ? `$$${latex}$$` : `$${latex}$`);
      }

      // Preserve HTML entities through sanitization
      const withPlaceholders = rendered
        .replace(/&amp;/g, '<!--AMP-->')
        .replace(/&lt;/g, '<!--LT-->')
        .replace(/&gt;/g, '<!--GT-->')
        .replace(/&quot;/g, '<!--QUOT-->');

      const sanitized = sanitizeHtmlWithStyles(withPlaceholders, sanitizer);
      if (!sanitized) {
        return escapeHtml(displayMode ? `$$${latex}$$` : `$${latex}$`);
      }

      // Restore HTML entities
      const restored = sanitized
        .replace(/<!--AMP-->/g, '&amp;')
        .replace(/<!--LT-->/g, '&lt;')
        .replace(/<!--GT-->/g, '&gt;')
        .replace(/<!--QUOT-->/g, '&quot;');

      return displayMode ? `<div class="latex-display-wrapper">${restored}</div>` : restored;
    });
  };

  /**
   * Process tables
   */
  const processTables = (input: string, processOpts: ProcessOptions): string => {
    const lines = input.split('\n');
    const tableMap = new Map<string, string>();
    let i = 0;

    while (i < lines.length) {
      // Check if line looks like a table row (starts with |, may or may not end with |)
      if (lines[i].match(/^\|.+/)) {
        const tableLines: string[] = [];
        let hasSeparator = false;

        // Collect table lines
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
          const currentTableIndex = tableCounter++;
          const placeholder = `--TABLE-${Math.random().toString(36).substring(2, 15)}--`;
          // Store table index and metadata in placeholder map
          tablePlaceholderMap.set(
            placeholder,
            JSON.stringify({
              tableIndex: currentTableIndex,
              hasSeparator,
              tableLines
            })
          );
          tableMap.set(placeholder, `<!--TABLE-PLACEHOLDER-${placeholder}-->`);

          // Initialize table data map for CSV export
          tableCellData.set(currentTableIndex, new Map());

          // Replace table lines with placeholder
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

    // Restore tables
    tableMap.forEach((html, placeholder) => {
      result = result.replace(placeholder, html);
    });

    return result;
  };

  /**
   * Create cache key for table
   */
  const createTableCacheKey = (
    tableLines: string[],
    hasSeparator: boolean,
    tableIndex: number
  ): string => {
    return `${tableLines.join('|||')}|||${hasSeparator}|||${tableIndex}|||${options?.downloadTableButton ?? ''}`;
  };

  /**
   * Create table HTML element (cached)
   */
  const createTableElement = (
    tableLines: string[],
    hasSeparator: boolean,
    tableIndex: number,
    processOpts: ProcessOptions
  ): HTMLElement => {
    const cacheKey = createTableCacheKey(tableLines, hasSeparator, tableIndex);

    return getCachedOrCreateElement(tableCache, tableCacheOrder, CACHE_SIZE, cacheKey, () => {
      const rows: string[] = [];
      const cellData = tableCellData.get(tableIndex);

      tableLines.forEach((line, rowIndex) => {
        if (!line.trim()) {
          return;
        }

        const escapedPipePlaceholder = `___ESCAPED_PIPE___${Math.random().toString(36).substring(2, 15)}___`;
        const contentWithPlaceholders = line.replace(/\\\|/g, escapedPipePlaceholder);
        const parts = contentWithPlaceholders.split('|');
        const cells = parts.slice(1, -1);

        const processedCells = cells.map((cell, cellIndex) => {
          // Restore escaped pipes and process cell content
          let originalCell = cell.replace(new RegExp(escapedPipePlaceholder, 'g'), '|').trim();

          // Extract inline code to protect <br> tags within code
          const inlineCodeMap = new Map<string, string>();
          originalCell = originalCell.replace(/(?<!\\)(?:\\\\)*`([^`]+)`/g, (match, content) => {
            const placeholder = `___INLINE_CODE_${Math.random().toString(36).substring(2, 15)}___`;
            inlineCodeMap.set(placeholder, match);
            return placeholder;
          });

          // Convert <br> tags to newlines for table cells (outside of code)
          originalCell = originalCell.replace(/<br\s*\/?>/gi, '\n');

          // Restore inline code
          inlineCodeMap.forEach((code, placeholder) => {
            originalCell = originalCell.replace(placeholder, code);
          });

          // Store in cellData if available
          if (cellData) {
            const rowData = cellData.get(rowIndex) ?? new Map<number, string>();
            rowData.set(cellIndex, originalCell);
            cellData.set(rowIndex, rowData);
          }

          // Process cell content for inline elements
          const processedContent = processMarkdown(originalCell, {
            allowCodeBlocks: false,
            allowBlockquotes: false,
            allowTables: false,
            allowLatex: true,
            allowInlineCode: true,
            allowLinks: true
          });

          return processedContent;
        });

        const isHeader = hasSeparator && rowIndex === 0;
        const tag = isHeader ? 'th' : 'td';
        const rowHtml = `<tr>${processedCells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
        rows.push(rowHtml);
      });

      // Filter out empty rows (check for text content OR innerHTML content)
      const filteredRows = rows.filter(row => {
        // Wrap in proper table structure for correct HTML parsing
        const tempTable = document.createElement('table');
        tempTable.innerHTML = `<tbody>${row}</tbody>`;
        const cells = tempTable.querySelectorAll('td, th');
        // Check if any cell has content
        return Array.from(cells).some(cell => {
          const hasText = !!cell.textContent?.trim();
          const hasHtml = !!cell.innerHTML?.trim();
          return hasText || hasHtml;
        });
      });

      if (filteredRows.length === 0) {
        return '<div></div>';
      }

      const tableId = `table-${Math.random().toString(36).substring(2, 15)}`;
      let tableHtml = '<table class="table table-hover" id="' + tableId + '">';

      if (hasSeparator && filteredRows.length > 0) {
        tableHtml += '<thead>' + filteredRows[0] + '</thead>';
        if (filteredRows.length > 1) {
          tableHtml += '<tbody>' + filteredRows.slice(1).join('') + '</tbody>';
        }
      } else {
        tableHtml += '<tbody>' + filteredRows.join('') + '</tbody>';
      }

      tableHtml += '</table>';

      // Add download button if enabled
      let downloadButton = '';
      if (options?.downloadTableButton) {
        const translatedLabel = options.translateSync
          ? options.translateSync(options.downloadTableButton)
          : options.downloadTableButton;
        const buttonLabel = escapeHtml(translatedLabel);
        downloadButton = `<button type="button" class="btn btn-circle btn-sm btn-tertiary element-download download-table-btn" data-table-id="${tableId}" data-table-index="${tableIndex}" aria-label="${buttonLabel}"></button>`;
      }

      return `<div class="table-wrapper">${downloadButton}${tableHtml}</div>`;
    });
  };

  /**
   * Process text segments separately from block elements
   */
  const processTextSegments = (input: string, domSanitizer: DomSanitizer): string => {
    // Split input by known block elements so we don't process text inside them
    // This regex matches complete block elements with their content
    const blockElementRegex =
      /(<(pre|blockquote|ul|ol|hr|h[1-6]|table)[^>]*>[\s\S]*?<\/\2>)|(<!--(?:CODE-BLOCK|TABLE|BLOCKQUOTE|LATEX-DISPLAY)-PLACEHOLDER-[^>]+-->)/g;

    const parts: string[] = [];
    let lastIndex = 0;
    let blockMatch;

    // Find all block elements and capture text between them
    while ((blockMatch = blockElementRegex.exec(input)) !== null) {
      // Add text before this block element
      if (blockMatch.index > lastIndex) {
        parts.push(input.slice(lastIndex, blockMatch.index));
      }
      // Add the block element itself
      parts.push(blockMatch[0]);
      lastIndex = blockMatch.index + blockMatch[0].length;
    }
    // Add any remaining text after the last block element
    if (lastIndex < input.length) {
      parts.push(input.slice(lastIndex));
    }

    const processedParts = parts.map(part => {
      // Keep block elements and placeholders as-is
      if (part.match(/^<(pre|blockquote|ul|ol|hr|h[1-6]|table)|^<!--/)) {
        return part;
      }

      // Only process text that's NOT inside block elements
      return processInlineFormatting(part, domSanitizer);
    });

    // Now restore inline LaTeX and links after inline formatting
    let result = processedParts.join('');

    // Restore inline LaTeX
    inlineLatexPlaceholderMap.forEach((latex, placeholder) => {
      const rendered = renderLatex(latex, false);
      result = result.replace(placeholder, rendered);
    });

    // Restore links
    linkPlaceholderMap.forEach((linkData, placeholder) => {
      const sanitizedUrl = sanitizeUrl(linkData.url, sanitizer);
      // Process link text for inline code only (no line breaks, no blocks)
      let linkText = linkData.text;

      // Process inline code in link text
      linkText = linkText.replace(/(?<!\\)(?:\\\\)*`([^`]+)`/g, (match, content) => {
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<code>${escaped}</code>`;
      });

      // Sanitize the link text
      const sanitizedText = domSanitizer.sanitize(SecurityContext.HTML, linkText) ?? '';
      const linkHtml = `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${sanitizedText}</a>`;
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

    // Lists (handle bullet character • which sanitizer converts to &#8226;)
    result = result.replace(/^[•\-*] (.+)$/gm, '<li class="unordered">$1</li>');
    result = result.replace(/^&#8226; (.+)$/gm, '<li class="unordered">$1</li>');
    result = result.replace(/^\d+\. (.+)$/gm, '<li class="ordered">$1</li>');

    // Wrap lists (remove whitespace between items to prevent spacing issues)
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

    // Clean up list classes
    result = result.replace(/ class="ordered"/g, '');
    result = result.replace(/ class="unordered"/g, '');

    // Paragraphs - convert double newlines to paragraph breaks
    const paragraphPlaceholder = '___PARAGRAPH_BREAK___';
    const segments = result.split(/\n{2,}/g);

    result = segments
      .map(segment => {
        const trimmed = segment.trim();
        // Skip empty segments entirely - don't render them
        if (!trimmed) {
          return '';
        }
        // If the segment starts with a block element, return as is
        if (/^\s*<(h[1-6]|pre|blockquote|ul|ol|hr|div|code|li|p)/.test(trimmed)) {
          // Replace newlines inside blocks with the placeholder
          return segment.replace(/\n/g, paragraphPlaceholder);
        }

        // Check if segment has actual text content (not just HTML tags/whitespace)
        const withoutTags = trimmed.replace(/<[^>]*>/g, '').trim();
        if (!withoutTags) {
          return '';
        }

        // Otherwise, wrap in <p> tags only if there's content
        return '<p>' + segment + '</p>';
      })
      .filter(segment => segment !== '') // Remove empty segments
      // Use newline placeholder so as not to replace newlines between blocks
      .join(paragraphPlaceholder)
      // Convert remaining newlines to line breaks
      .replace(/\n/g, '<br>')
      // Restore newline placeholders
      .replace(new RegExp(paragraphPlaceholder, 'g'), ' ');

    // Restore escaped characters
    result = result.replace(/___ESCAPED_ASTERISK___/g, '*');
    result = result.replace(/___ESCAPED_UNDERSCORE___/g, '_');

    // Sanitize the final result
    const sanitized = domSanitizer.sanitize(SecurityContext.HTML, result);
    return sanitized ?? '';
  };

  /**
   * Main render function
   */
  return (text: string): HTMLElement => {
    const div = document.createElement('div');
    div.className = 'markdown-content text-break';

    if (text === null || text === undefined) {
      return div;
    }

    const processedHtml = processMarkdown(text);
    div.innerHTML = processedHtml;

    // Replace comment placeholders with cached elements
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_COMMENT);
    const commentsToReplace: { comment: Comment; element: HTMLElement }[] = [];

    let currentNode = walker.nextNode();
    while (currentNode) {
      const comment = currentNode as Comment;

      // Handle code block placeholders
      const codeMatch = comment.textContent?.match(/CODE-BLOCK-PLACEHOLDER-(.*)/);
      if (codeMatch) {
        const placeholderId = codeMatch[1];
        const cacheKey = codeBlockPlaceholderMap.get(placeholderId);
        if (cacheKey) {
          const parts = cacheKey.split('|||');
          const language = parts[0];
          const content = parts[1];
          const isMarkdown = parts[3] === 'true';
          const cachedElement = createCodeBlockElement(language, content, isMarkdown);
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
            const { tableIndex, hasSeparator, tableLines } = JSON.parse(tableDataJson);
            const cachedElement = createTableElement(tableLines, hasSeparator, tableIndex, {
              allowCodeBlocks: false,
              allowBlockquotes: false,
              allowTables: false,
              allowLatex: true,
              allowInlineCode: true,
              allowLinks: true
            });
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

    // Replace all comment placeholders with their cached elements
    commentsToReplace.forEach(({ comment, element }) => {
      if (comment.parentNode && element) {
        comment.parentNode.replaceChild(element.cloneNode(true), comment);
      }
    });

    // Add event listeners for copy buttons
    div.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = e.target as HTMLButtonElement;
        const codeId = button.getAttribute('data-code-id');
        if (!codeId) return;

        const codeElement = div.querySelector(`#${codeId}`);
        if (!codeElement) return;

        const code = codeElement.textContent ?? '';
        navigator.clipboard.writeText(code).catch(() => {
          console.warn('Failed to copy code to clipboard');
        });
      });
    });

    // Add event listeners for table download buttons
    div.querySelectorAll('.download-table-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = e.target as HTMLButtonElement;
        const tableId = button.getAttribute('data-table-id');
        const tableIndexStr = button.getAttribute('data-table-index');
        if (!tableId || tableIndexStr === null) return;

        const tableElement = div.querySelector(`#${tableId}`) as HTMLTableElement;
        if (!tableElement) return;

        const tableIndex = parseInt(tableIndexStr, 10);
        const tableData = tableCellData.get(tableIndex);

        // Convert table to CSV
        const rows = Array.from(tableElement.querySelectorAll('tr'));
        const csv = rows
          .filter(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.some(cell => (cell.textContent ?? '').trim().length > 0);
          })
          .map((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells
              .map((cell, columnIndex) => {
                const cellText =
                  tableData?.get(rowIndex)?.get(columnIndex) ?? cell.textContent ?? '';
                if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
                  return `"${cellText.replace(/"/g, '""')}"`;
                }
                return cellText;
              })
              .join(',');
          })
          .join('\n');

        // Create and trigger download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'table.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
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
