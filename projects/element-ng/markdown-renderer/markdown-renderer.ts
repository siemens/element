/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type {
  SiTranslateService,
  TranslatableString
} from '@siemens/element-translate-ng/translate';

import {
  sanitizeHtmlWithStyles,
  getCachedOrCreateElement,
  getCachedOrCreateString
} from './markdown-renderer-helpers';

const CACHE_SIZE = 50;

export interface MarkdownRendererOptions {
  /**
   * Provide this to enable the copy code button functionality.
   * Label for the copy code button (will be translated internally if translateService is provided).
   * @defaultValue undefined
   */
  copyCodeButton?: TranslatableString;
  /**
   * Provide this to enable the table CSV download button functionality.
   * Download button label for table CSV export (will be translated internally if translateService is provided).
   * @defaultValue undefined
   */
  downloadTableButton?: TranslatableString;
  /**
   * Optional syntax highlighter function.
   * Receives code content and optional language, returns an HTML content string to display inside of the code block or undefined to use default rendering.
   * The returned code is sanitized before insertion.
   * Make sure that the required styles/scripts for the syntax highlighter are included in your application.
   * @defaultValue undefined
   */
  syntaxHighlighter?: (code: string, language?: string) => string | undefined;
  /**
   * Optional LaTeX renderer function.
   * Receives LaTeX content and display mode boolean, returns an HTML content string or undefined to use default rendering.
   * The returned HTML is sanitized before insertion.
   * Make sure that the required styles/scripts for the LaTeX renderer (e.g., KaTeX) are included in your application.
   * @defaultValue undefined
   */
  latexRenderer?: (latex: string, displayMode: boolean) => string | undefined;
  /**
   * Optional translate sync function of a service instance for translating the copy button label and download button label.
   * @defaultValue undefined
   */
  translateSync?: SiTranslateService['translateSync'];
}

/**
 * Returns a markdown renderer function which_
 * - Transforms markdown text into formatted HTML.
 * - Returns a DOM node containing the formatted content.
 *
 * **Warning:** The returned Node is inserted without additional sanitization.
 * Input content is sanitized before processing.
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
  const codeBlockCache = new Map<string, HTMLElement>();
  const tableCache = new Map<string, HTMLElement>();
  const latexCache = new Map<string, string>();
  const codeBlockCacheOrder: string[] = [];
  const tableCacheOrder: string[] = [];
  const latexCacheOrder: string[] = [];

  return (text: string): Node => {
    const div = document.createElement('div');
    div.className = 'markdown-content text-break';

    // Map to store original table cell content: tableIndex -> rowIndex -> columnIndex -> original text
    const tableCellData = new Map<number, Map<number, Map<number, string>>>();

    // Maps to track placeholder IDs to cache keys
    const tablePlaceholderMap = new Map<string, string>();
    const codeBlockCachePlaceholderMap = new Map<string, string>();
    let tablePlaceholderCounter = 0;
    const codeBlockPlaceholderState = { counter: 0 };

    if (!text) {
      return div;
    }

    // Generate a random placeholder for newlines to preserve them during HTML sanitization
    const newlinePlaceholder = `--NEWLINE-${Math.random().toString(36).substring(2, 15)}--`;

    // Replace newlines with placeholder before sanitization
    let valueWithPlaceholders = text.replace(/\n/g, newlinePlaceholder);

    // Replace code blocks with placeholders to preserve them during sanitization
    const codeBlockPlaceholderMap = new Map<string, string>();
    valueWithPlaceholders = valueWithPlaceholders
      // Preserve code blocks by replacing them with placeholders
      .replace(/```([\s\S]*?)```/g, match => {
        const codePlaceholder = `--CODE-BLOCK-${Math.random().toString(36).substring(2, 15)}--`;
        codeBlockPlaceholderMap.set(codePlaceholder, match);
        return codePlaceholder;
      });

    // Sanitize the input using Angular's HTML sanitizer
    const sanitizedInput = sanitizer.sanitize(SecurityContext.HTML, valueWithPlaceholders) ?? '';

    // Restore newlines from placeholder for markdown processing.
    let html = sanitizedInput.replace(new RegExp(newlinePlaceholder, 'g'), '\n');

    // Restore code blocks from placeholders
    codeBlockPlaceholderMap.forEach((codeBlock, placeholder) => {
      // In the blocks, restore newlines from placeholder for markdown processing.
      html = html.replace(
        new RegExp(placeholder, 'g'),
        codeBlock.replace(new RegExp(newlinePlaceholder, 'g'), '\n')
      );
    });

    // Process tables first
    let tableIndex = -1;
    const rowIndexMap = new Map<number, number>();
    const tableHasSeparator = new Map<number, boolean>();

    html = html
      // Mark tables that have separator lines (these have headers)
      .replace(/^\|(.+)\|\s*\n\|\s*[-:]+.*\|\s*$/gm, match => {
        const nextTableIndex = tableIndex + 1;
        tableHasSeparator.set(nextTableIndex, true);
        return match;
      })
      // Remove table separator lines
      .replace(/^\|\s*[-:]+.*\|\s*$/gm, '')
      // Process table rows
      .replace(/^\|(.+)\|\s*$/gm, (_match, htmlContent) => {
        // Track which table we're in (increment on first row of each table)
        const isFirstRow = rowIndexMap.get(tableIndex) === undefined;
        if (isFirstRow) {
          tableIndex++;
          rowIndexMap.set(tableIndex, 0);
          tableCellData.set(tableIndex, new Map());
        }

        const currentRowIndex = rowIndexMap.get(tableIndex)!;
        const tableData = tableCellData.get(tableIndex)!;
        tableData.set(currentRowIndex, new Map());
        const rowData = tableData.get(currentRowIndex)!;
        const isHeaderRow = currentRowIndex === 0 && tableHasSeparator.get(tableIndex);

        // Handle escaped pipes by temporarily replacing them
        const escapedPipePlaceholder = `--ESCAPED-PIPE-${Math.random().toString(36).substring(2, 15)}--`;
        const contentWithPlaceholders = htmlContent.replace(/\\\|/g, escapedPipePlaceholder);
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
            (_innerMatch, inlineCodeContent) => {
              return '`' + inlineCodeContent.replace(/`/g, '') + '`';
            }
          );
          // Temporarily replace single line code blocks to avoid replacing <br> inside them
          const tableInlineCodeBrPlaceholder = `--INLINE-CODE-BR--${Math.random().toString(36).substring(2, 15)}--`;
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

        // Recursively process cell content for markdown formatting and store original data
        const processedCells = cellsWithNewlines.map((cell: string, index: number) => {
          const formattedContent = transformMarkdownText(
            cell,
            false,
            sanitizer,
            options,
            codeBlockCache,
            codeBlockCacheOrder,
            CACHE_SIZE,
            codeBlockCachePlaceholderMap,
            codeBlockPlaceholderState,
            latexCache,
            latexCacheOrder
          );
          // Store original cell text in the map
          rowData.set(index, cells[index]);
          return formattedContent;
        });

        // Increment row index for next row
        rowIndexMap.set(tableIndex, currentRowIndex + 1);

        const cellTag = isHeaderRow ? 'th' : 'td';
        return `<tr>${processedCells.map((cell: string) => `<${cellTag}>${cell}</${cellTag}>`).join('')}</tr>`;
      })
      // Wrap header rows in thead
      .replace(/(<tr><th>[\s\S]*?<\/th><\/tr>)/g, '<thead>$1</thead>')
      // Wrap body rows in tbody (rows that are not already in thead)
      .replace(
        /(<tr><td>[\s\S]*?<\/td><\/tr>(?:\s*<tr><td>[\s\S]*?<\/td><\/tr>)*)/g,
        '<tbody>$1</tbody>'
      )
      // Wrap table rows in table elements (match thead+tbody together or just tbody)
      .replace(
        /(?:<thead><tr><th>[\s\S]*?<\/th><\/tr><\/thead>\s*)?<tbody><tr><td>[\s\S]*?<\/td><\/tr>(?:\s*<tr><td>[\s\S]*?<\/td><\/tr>)*<\/tbody>/g,
        (() => {
          let currentTableWrapIndex = -1;

          const translatedLabel =
            options?.downloadTableButton && options?.translateSync
              ? options.translateSync(options.downloadTableButton)
              : options?.downloadTableButton
                ? String(options.downloadTableButton)
                : undefined;
          const buttonLabel = translatedLabel
            ?.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

          return (match: string) => {
            currentTableWrapIndex++;
            const cacheKey = `${match}|||${options?.downloadTableButton ?? ''}`;
            const placeholderId = `table-${tablePlaceholderCounter++}`;
            tablePlaceholderMap.set(placeholderId, cacheKey);

            getCachedOrCreateElement(tableCache, tableCacheOrder, CACHE_SIZE, cacheKey, () => {
              const tableId = `table-${Math.random().toString(36).substring(2, 15)}`;

              const downloadTableCsvButton = buttonLabel
                ? `<button type="button" class="btn btn-circle btn-sm btn-tertiary element-download download-table-btn" data-table-id="${tableId}" data-table-index="${currentTableWrapIndex}" aria-label="${buttonLabel}"></button>`
                : '';

              return `<div class="table-wrapper">${downloadTableCsvButton}<table class="table table-hover" id="${tableId}">${match}</table></div>`;
            });
            return `<!--TABLE-PLACEHOLDER-${placeholderId}-->`;
          };
        })()
      )
      // Remove duplicate table tags
      .replace(
        /<\/table><\/div>\s*<div class="table-wrapper"><button[^>]*><\/button><table class="table table-hover"[^>]*>/g,
        ''
      );

    html = transformMarkdownText(
      html,
      true,
      sanitizer,
      options,
      codeBlockCache,
      codeBlockCacheOrder,
      CACHE_SIZE,
      codeBlockCachePlaceholderMap,
      codeBlockPlaceholderState,
      latexCache,
      latexCacheOrder
    );

    div.innerHTML = html;

    // Replace placeholders with cached elements
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_COMMENT);
    const commentsToReplace: { comment: Comment; element: HTMLElement }[] = [];

    let currentNode = walker.nextNode();
    while (currentNode) {
      const comment = currentNode as Comment;
      const tableMatch = comment.textContent?.match(/TABLE-PLACEHOLDER-(.*)/);
      if (tableMatch) {
        const placeholderId = tableMatch[1];
        const cacheKey = tablePlaceholderMap.get(placeholderId);
        if (cacheKey) {
          const cachedElement = tableCache.get(cacheKey);
          if (cachedElement) {
            commentsToReplace.push({ comment, element: cachedElement });
          }
        }
      }

      const codeMatch = comment.textContent?.match(/CODE-BLOCK-PLACEHOLDER-(.*)/);
      if (codeMatch) {
        const placeholderId = codeMatch[1];
        const cacheKey = codeBlockCachePlaceholderMap.get(placeholderId);
        if (cacheKey) {
          const cachedElement = codeBlockCache.get(cacheKey);
          if (cachedElement) {
            commentsToReplace.push({ comment, element: cachedElement });
          }
        }
      }

      currentNode = walker.nextNode();
    }

    // Replace all comments with their cached elements
    commentsToReplace.forEach(({ comment, element }) => {
      comment.parentNode?.replaceChild(element, comment);
    });

    // Add copy functionality to code blocks
    div.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = e.target as HTMLButtonElement;
        const codeId = button.getAttribute('data-code-id');
        if (!codeId) {
          return;
        }

        const codeElement = div.querySelector(`#${codeId}`);
        if (!codeElement) {
          return;
        }

        const code = codeElement.textContent ?? '';

        navigator.clipboard.writeText(code).catch(() => {
          // Clipboard API may fail if not in a secure context or permissions denied
          console.warn('Failed to copy code to clipboard');
        });
      });
    });

    // Add download functionality to tables (CSV export)
    div.querySelectorAll('.download-table-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = e.target as HTMLButtonElement;
        const tableId = button.getAttribute('data-table-id');
        const tableIndexStr = button.getAttribute('data-table-index');
        if (!tableId || tableIndexStr === null) {
          return;
        }

        const tableElement = div.querySelector(`#${tableId}`) as HTMLTableElement;
        if (!tableElement) {
          return;
        }

        const currentTableIndex = parseInt(tableIndexStr, 10);
        const tableData = tableCellData.get(currentTableIndex);

        // Convert table to CSV
        const rows = Array.from(tableElement.querySelectorAll('tr'));
        const csv = rows
          .map((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells
              .map((cell, columnIndex) => {
                // Use original text from map, fallback to textContent
                const cellText =
                  tableData?.get(rowIndex)?.get(columnIndex) ?? cell.textContent ?? '';
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
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

const transformMarkdownText = (
  html: string,
  keepAdditionalNewlines = true,
  sanitizer: DomSanitizer,
  options?: MarkdownRendererOptions,
  codeBlockCache?: Map<string, HTMLElement>,
  codeBlockCacheOrder?: string[],
  cacheSize?: number,
  codeBlockCachePlaceholderMap?: Map<string, string>,
  codeBlockPlaceholderState?: { counter: number },
  latexCache?: Map<string, string>,
  latexCacheOrder?: string[]
): string => {
  // Generate a random placeholder for inner code blocks to prevent markdown processing inside them
  const innerCodeQuotePlaceholder = `--INNER-CODE-${Math.random().toString(36).substring(2, 15)}--`;
  const codeSectionPlaceholderMap = new Map<string, string>();

  const escapedAsteriskPlaceholder = `--ASTERISK-${Math.random().toString(36).substring(2, 15)}--`;
  const escapedUnderscorePlaceholder = `--UNDERSCORE-${Math.random().toString(36).substring(2, 15)}--`;
  const escapedDollarPlaceholder = `--DOLLAR-${Math.random().toString(36).substring(2, 15)}--`;

  // Apply markdown transformations to the sanitized content

  // Add temporary closing backticks at the end to handle incomplete code blocks during streaming
  const tempClosingMarker = `\n\`\`\`--TEMP-CLOSE--\n`;
  html = html + tempClosingMarker;

  html = html
    // Multiline code blocks ```code``` with placeholder
    .replace(/```([^\n]*)\n?([\s\S]*?)\n?```/g, (match, language, content) => {
      const cacheKey = `${language}|||${content}|||${options?.copyCodeButton ?? ''}`;

      if (
        codeBlockCache &&
        codeBlockCacheOrder &&
        cacheSize &&
        codeBlockCachePlaceholderMap &&
        codeBlockPlaceholderState
      ) {
        const placeholderId = `code-${codeBlockPlaceholderState.counter++}`;
        codeBlockCachePlaceholderMap.set(placeholderId, cacheKey);

        getCachedOrCreateElement(codeBlockCache, codeBlockCacheOrder, cacheSize, cacheKey, () => {
          // Escape HTML special characters in code blocks (not for security, but for correct display) and preserve inner backticks
          const escapedCode = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/`/g, innerCodeQuotePlaceholder);

          const codeId = `code-${Math.random().toString(36).substring(2, 15)}`;

          // Apply syntax highlighting if highlighter is provided
          const highlightedCode = options?.syntaxHighlighter
            ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              options.syntaxHighlighter(content, language?.trim() || undefined)
            : undefined;

          // Apply sanitization to the final code content
          const codeBlockContent = sanitizer.sanitize(
            SecurityContext.HTML,
            highlightedCode ?? escapedCode
          );

          const translatedLabel =
            options?.copyCodeButton && options?.translateSync
              ? options.translateSync(options.copyCodeButton)
              : options?.copyCodeButton
                ? String(options.copyCodeButton)
                : undefined;
          const buttonLabel = translatedLabel
            ?.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
          const codeCopyButton = buttonLabel
            ? `<button type="button" class="btn btn-circle btn-sm btn-tertiary element-copy copy-code-btn" data-code-id="${codeId}" aria-label="${buttonLabel}"></button>`
            : '';

          return `<div class="code-wrapper">${codeCopyButton}<pre><code id="${codeId}">${codeBlockContent}</code></pre></div>`;
        });
        return `<!--CODE-BLOCK-PLACEHOLDER-${placeholderId}-->`;
      } else {
        // Escape HTML special characters in code blocks (not for security, but for correct display) and preserve inner backticks
        const escapedCode = content
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/`/g, innerCodeQuotePlaceholder);

        const codeId = `code-${Math.random().toString(36).substring(2, 15)}`;

        // Apply syntax highlighting if highlighter is provided
        const highlightedCode = options?.syntaxHighlighter
          ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            options.syntaxHighlighter(content, language?.trim() || undefined)
          : undefined;

        // Apply sanitization to the final code content
        const codeBlockContent = sanitizer.sanitize(
          SecurityContext.HTML,
          highlightedCode ?? escapedCode
        );

        const translatedLabel =
          options?.copyCodeButton && options?.translateSync
            ? options.translateSync(options.copyCodeButton)
            : options?.copyCodeButton
              ? String(options.copyCodeButton)
              : undefined;
        const buttonLabel = translatedLabel
          ?.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        const codeCopyButton = buttonLabel
          ? `<button type="button" class="btn btn-circle btn-sm btn-tertiary element-copy copy-code-btn" data-code-id="${codeId}" aria-label="${buttonLabel}"></button>`
          : '';

        const code = `<div class="code-wrapper">${codeCopyButton}<pre><code id="${codeId}">${codeBlockContent}</code></pre></div>`;
        const codePlaceholder = `--CODE-BLOCK-${Math.random().toString(36).substring(2, 15)}--`;
        codeSectionPlaceholderMap.set(codePlaceholder, code);
        return codePlaceholder;
      }
    });

  // Remove temporary closing marker if it's still there (wasn't part of a code block)
  html = html.replace(tempClosingMarker, '').replace(/--TEMP-CLOSE--/g, '');

  // Process LaTeX expressions after code blocks are extracted
  const latexPlaceholderMap = new Map<string, string>();

  // Replace escaped dollar signs before processing LaTeX
  html = html.replace(/\\\$/g, escapedDollarPlaceholder);

  // Display math: $$ ... $$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
    if (options?.latexRenderer) {
      try {
        const cacheKey = `display|||${latex.trim()}`;

        // Check cache first (if available)
        const cached =
          latexCache && latexCacheOrder
            ? getCachedOrCreateString(latexCache, latexCacheOrder, CACHE_SIZE, cacheKey, () => {
                const rendered = options.latexRenderer?.(latex.trim(), true);
                if (rendered) {
                  const sanitized = sanitizeHtmlWithStyles(rendered, sanitizer);
                  if (sanitized) {
                    return `<div class="latex-display-wrapper">${sanitized}</div>`;
                  }
                }
                return '';
              })
            : (() => {
                const rendered = options.latexRenderer?.(latex.trim(), true);
                if (rendered) {
                  const sanitized = sanitizeHtmlWithStyles(rendered, sanitizer);
                  if (sanitized) {
                    return `<div class="latex-display-wrapper">${sanitized}</div>`;
                  }
                }
                return '';
              })();

        if (cached) {
          const latexPlaceholder = `--LATEX-DISPLAY-${Math.random().toString(36).substring(2, 15)}--`;
          latexPlaceholderMap.set(latexPlaceholder, cached);
          return latexPlaceholder;
        }
      } catch {
        // If rendering fails, return the original
      }
    }
    return match;
  });

  // Inline math: $ ... $ (but not $$)
  html = html.replace(/(?<!\$)\$(?!\$)((?:(?!\$)[\s\S])+?)\$(?!\$)/g, (match, latex) => {
    if (options?.latexRenderer) {
      try {
        const cacheKey = `inline|||${latex.trim()}`;

        // Check cache first (if available)
        const cached =
          latexCache && latexCacheOrder
            ? getCachedOrCreateString(latexCache, latexCacheOrder, CACHE_SIZE, cacheKey, () => {
                const rendered = options.latexRenderer?.(latex.trim(), false);
                if (rendered) {
                  const sanitized = sanitizeHtmlWithStyles(rendered, sanitizer);
                  return sanitized ?? '';
                }
                return '';
              })
            : (() => {
                const rendered = options.latexRenderer?.(latex.trim(), false);
                if (rendered) {
                  const sanitized = sanitizeHtmlWithStyles(rendered, sanitizer);
                  return sanitized ?? '';
                }
                return '';
              })();

        if (cached) {
          const latexPlaceholder = `--LATEX-INLINE-${Math.random().toString(36).substring(2, 15)}--`;
          latexPlaceholderMap.set(latexPlaceholder, cached);
          return latexPlaceholder;
        }
      } catch {
        // If rendering fails, return the original
      }
    }
    return match;
  });

  html = html

    // Inline code `text`
    .replace(/`(.*?)`/g, (match, content) => {
      // Escape HTML special characters in inline code (not for security, but for correct display)
      const code = `<code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
      const codePlaceholder = `--INLINE-CODE-${Math.random().toString(36).substring(2, 15)}--`;
      codeSectionPlaceholderMap.set(codePlaceholder, code);
      return codePlaceholder;
    })

    // Images ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
      const sanitizedUrl = sanitizeUrl(url, sanitizer);
      const escapedAlt = alt
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<img src="${sanitizedUrl}" alt="${escapedAlt}">`;
    })

    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      const sanitizedUrl = sanitizeUrl(url, sanitizer);
      return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })

    // Auto-detect URLs and convert to links
    .replace(/(?<!["'=(])\b(https?:\/\/[^\s<]+[^\s<.,;!?"')\]])/g, match => {
      const sanitizedUrl = sanitizeUrl(match, sanitizer);
      return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    })

    .replace(/(?<!\\)\\\*/g, escapedAsteriskPlaceholder)
    .replace(/(?<!\\)\\_/g, escapedUnderscorePlaceholder)

    // Bold **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')

    // Italic *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')

    .replace(new RegExp(escapedAsteriskPlaceholder, 'g'), '*')
    .replace(new RegExp(escapedUnderscorePlaceholder, 'g'), '_')

    // Headings #, ##, ###, etc.
    .replace(/^###### (.*$)/gm, '<strong>$1</strong>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h2><strong>$1</strong></h2>')

    // Horizontal rule ---
    .replace(/^---+$/gm, '<hr>');

  html = html
    // Bullet points - handle each type separately (• gets converted to &#8226; by sanitizer)
    .replace(/^&#8226; (.*$)/gm, '<li class="unordered">$1</li>')
    .replace(/^- (.*$)/gm, '<li class="unordered">$1</li>')
    .replace(/^\* (.*$)/gm, '<li class="unordered">$1</li>')

    // Ordered list items (1., 2., 3., etc.)
    .replace(/^\d+\. (.*$)/gm, '<li class="ordered">$1</li>');

  html = html.replace(/^\s*(?:>|&gt;)\s*(.*)$/gm, '<blockquote>$1</blockquote>');

  // Generate a random placeholder for newlines to differentiate them from those used for paragraphs
  const finalNewlinePlaceholder = `--NEWLINE-${Math.random().toString(36).substring(2, 15)}--`;

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

  // Restore LaTeX placeholders
  latexPlaceholderMap.forEach((latex, placeholder) => {
    html = html.replace(new RegExp(placeholder, 'g'), latex);
  });

  // Restore escaped dollar signs
  html = html.replace(new RegExp(escapedDollarPlaceholder, 'g'), '$');

  return html;
};

/**
 * Sanitizes a URL to prevent XSS attacks
 * @param url - The URL to sanitize
 * @param sanitizer - Angular DomSanitizer instance
 * @returns The sanitized URL or '#' if invalid
 */
const sanitizeUrl = (url: string, sanitizer: DomSanitizer): string => {
  // Remove any whitespace
  url = url.trim();

  // Allow only http, https, and mailto protocols
  const allowed = /^(https?:\/\/|mailto:|\/(?!\/)|\.{1,2}\/|#)/i;

  // Sanitize the URL using Angular's sanitizer
  if (!allowed.test(url)) {
    return '#';
  }

  // Sanitize the URL using Angular's sanitizer
  const sanitized = sanitizer.sanitize(SecurityContext.URL, url);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return sanitized || '#';
};
