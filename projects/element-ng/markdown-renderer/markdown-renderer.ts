/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID, Provider, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  injectSiTranslateService,
  t,
  type SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { type TranslatableString } from '@siemens/element-translate-ng/translate-types';
import { micromark } from 'micromark';
import {
  gfmAutolinkLiteral,
  gfmAutolinkLiteralHtml
} from 'micromark-extension-gfm-autolink-literal';
import { gfmStrikethrough, gfmStrikethroughHtml } from 'micromark-extension-gfm-strikethrough';
import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';
import type { CompileContext, Extension, HtmlExtension, Token } from 'micromark-util-types';

// Augment CompileData with custom fields used by our HTML extension
declare module 'micromark-util-types' {
  interface CompileData {
    codeLanguage?: string | undefined;
    codeContent?: string | undefined;
    currentTableId?: string | undefined;
    currentTableIndex?: number | undefined;
    inParagraph?: boolean | undefined;
  }
}

export interface MarkdownRendererOptions {
  /**
   * Optional syntax highlighter function for code blocks.
   * Receives code content and optional language, returns highlighted HTML or undefined.
   */
  syntaxHighlighter?: (code: string, language?: string) => string | undefined;

  /**
   * Provide this to enable the copy code button functionality.
   * Label for the copy code button (will be translated internally if translateSync is provided).
   */
  copyCodeButton?: TranslatableString;

  /**
   * Provide this to enable the download table button functionality.
   * Label for the download table button (will be translated internally if translateSync is provided).
   */
  downloadTableButton?: TranslatableString;

  /**
   * Synchronous translation function for button labels.
   */
  translateSync?: SiTranslateService['translateSync'];

  /**
   * Micromark syntax and HTML extensions for math support.
   * Pass the result of dynamically importing `micromark-extension-math` to enable LaTeX rendering.
   *
   * @example
   * ```typescript
   * const { math, mathHtml } = await import('micromark-extension-math');
   * const options = {
   *   mathExtensions: { syntax: math(), html: mathHtml() }
   * };
   * ```
   */
  mathExtensions?: {
    syntax: Extension;
    html: HtmlExtension;
  };
}

/**
 * Returns a function that transforms markdown text into a formatted HTML node.
 *
 * Uses [micromark](https://github.com/micromark/micromark) for CommonMark-compliant parsing
 * with GFM extensions (tables, autolink literals, strikethrough).
 *
 * @experimental
 */
const createMarkdownRenderer = (
  sanitizer: DomSanitizer,
  options?: MarkdownRendererOptions,
  doc?: Document,
  isBrowser?: boolean
): ((text: string) => Node) => {
  const docRef = doc ?? document;
  const isInBrowser = isBrowser ?? true;

  // Build micromark extensions
  const syntaxExtensions: Extension[] = [gfmTable(), gfmAutolinkLiteral(), gfmStrikethrough()];
  const htmlExtensions: HtmlExtension[] = [
    gfmTableHtml(),
    gfmAutolinkLiteralHtml(),
    gfmStrikethroughHtml()
  ];

  if (options?.mathExtensions) {
    syntaxExtensions.push(options.mathExtensions.syntax);
    htmlExtensions.push(options.mathExtensions.html);
  }

  // Custom HTML extension — placed last so it overrides defaults
  htmlExtensions.push(createCustomHtmlExtension(options));

  const preprocessText = (text: string): string => {
    let result = text;
    result = result.replace(/^[•] /gm, '- ');
    result = result.replace(/^&#8226; /gm, '- ');
    result = result.replace(/^\* /gm, '- ');

    if (options?.mathExtensions) {
      result = result.replace(/\$\$([^\n]+?)\$\$/g, '$$$$\n$1\n$$$$');
    }

    return result;
  };

  const attachEventListeners = (container: HTMLElement): void => {
    if (!isInBrowser) {
      return;
    }

    container.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = (e.target as HTMLElement).closest('.copy-code-btn') as HTMLButtonElement;
        const codeId = button?.getAttribute('data-code-id');
        if (!codeId) {
          return;
        }
        const codeElement = container.querySelector(`#${codeId}`);
        if (!codeElement) {
          return;
        }
        navigator.clipboard.writeText(codeElement.textContent ?? '').catch(() => {
          console.warn('Failed to copy code to clipboard');
        });
      });
    });

    container.querySelectorAll('.download-table-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const button = (e.target as HTMLElement).closest(
          '.download-table-btn'
        ) as HTMLButtonElement;
        const tableId = button?.getAttribute('data-table-id');
        if (!tableId) {
          return;
        }
        const tableElement = container.querySelector(`#${tableId}`) as HTMLTableElement;
        if (!tableElement) {
          return;
        }

        const csv = Array.from(tableElement.querySelectorAll('tr'))
          .filter(row =>
            Array.from(row.querySelectorAll('td, th')).some(
              cell => (cell.textContent ?? '').trim().length > 0
            )
          )
          .map(row =>
            Array.from(row.querySelectorAll('td, th'))
              .map(cell => {
                const text = cell.textContent ?? '';
                return text.includes(',') || text.includes('"') || text.includes('\n')
                  ? `"${text.replace(/"/g, '""')}"`
                  : t;
              })
              .join(',')
          )
          .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = docRef.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'table.csv');
        link.style.visibility = 'hidden';
        docRef.body.appendChild(link);
        link.click();
        docRef.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    });
  };

  /**
   * Post-process the DOM to apply code block wrappers.
   * Code blocks require DOM manipulation because the wrapper must surround
   * the <pre> element that micromark emits before we can intervene.
   */
  const applyCodeBlockWrappers = (container: HTMLElement): void => {
    container.querySelectorAll('pre').forEach(pre => {
      const codeElement = pre.querySelector('code');
      if (!codeElement) {
        return;
      }

      const langClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
      const language = langClass?.replace('language-', '') ?? '';
      const code = codeElement.textContent ?? '';
      const codeId = `code-${Math.random().toString(36).substring(2, 15)}`;

      codeElement.id = codeId;

      // Apply syntax highlighting
      if (options?.syntaxHighlighter && language) {
        const highlighted = options.syntaxHighlighter(code, language);
        if (highlighted) {
          codeElement.innerHTML = sanitizer.sanitize(SecurityContext.HTML, highlighted) ?? '';
        }
      }

      // Build copy button
      let copyButton = '';
      if (options?.copyCodeButton) {
        const translatedLabel = options.translateSync
          ? options.translateSync(options.copyCodeButton)
          : options.copyCodeButton;
        const buttonLabel = escapeHtml(translatedLabel);
        copyButton = `<button type="button" class="btn btn-tertiary btn-sm copy-code-btn" data-code-id="${codeId}" aria-label="${buttonLabel}"><i class="icon element-copy" aria-hidden="true"></i><span class="copy-code-label">${buttonLabel}</span></button>`;
      }

      const languageLabel = language
        ? `<span class="code-language">${escapeHtml(language)}</span>`
        : '';
      const headerContent =
        copyButton || languageLabel
          ? `<div class="code-header">${languageLabel}${copyButton}</div>`
          : '';
      const wrapperClass = headerContent ? 'code-wrapper has-header' : 'code-wrapper';

      // Wrap the <pre> element
      const wrapper = docRef.createElement('div');
      wrapper.className = wrapperClass;
      wrapper.innerHTML = headerContent;
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    });
  };

  /**
   * Post-process table cells:
   * - Restore &lt;br&gt; to actual <br> elements (escaped by micromark)
   * - Convert list-like content (- item<br>- item) into proper <ul><li>
   */
  const processTableCells = (container: HTMLElement): void => {
    container.querySelectorAll('td, th').forEach(cell => {
      let html = cell.innerHTML;

      // Restore escaped <br> tags to real <br>
      html = html.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
      cell.innerHTML = html;

      // Convert list patterns (- item<br>- item) into <ul><li>
      html = cell.innerHTML;
      if (!/(?:^|\n|<br\s*\/?>)- /.test(html)) {
        return;
      }

      const parts = html.split(/<br\s*\/?>/i);
      const listItems: string[] = [];
      const nonListParts: string[] = [];

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith('- ')) {
          listItems.push(trimmed.slice(2));
        } else if (listItems.length > 0) {
          nonListParts.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
          listItems.length = 0;
          nonListParts.push(trimmed);
        } else {
          nonListParts.push(trimmed);
        }
      }
      if (listItems.length > 0) {
        nonListParts.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
      }
      cell.innerHTML = nonListParts.join('<br>');
    });
  };

  return (text: string): HTMLElement => {
    const div = docRef.createElement('div');
    div.className = 'markdown-content text-break';

    if (text === null || text === undefined) {
      return div;
    }

    const html = micromark(preprocessText(text), {
      allowDangerousHtml: true,
      extensions: syntaxExtensions,
      htmlExtensions
    });

    div.innerHTML = html;
    sanitizeDom(div);
    customizeLinks(div, sanitizer);
    if (options?.mathExtensions) {
      wrapDisplayMath(div, docRef);
    }
    applyCodeBlockWrappers(div);
    processTableCells(div);
    attachEventListeners(div);
    return div;
  };
};

/**
 * Custom micromark HTML extension that produces the correct output inline
 * during compilation, avoiding regex-based post-processing.
 *
 * Overrides:
 * - Headings: h1 → h2+strong, h6 → strong
 * - Lists: always tight (no <p> wrapping in <li>)
 * - Paragraphs: track inParagraph state for lineEnding handler
 * - Tables: class="table table-hover", wrapped in .table-wrapper, download button
 * - Line endings: soft breaks → <br /> inside paragraphs only
 *
 * Customizations done via DOM post-processing (not here):
 * - Links: target="_blank", rel="noopener noreferrer", class="link-text"
 * - Math display: wrapped in .latex-display-wrapper
 * - HTML sanitization: dangerous elements/attributes removed
 */
const createCustomHtmlExtension = (options?: MarkdownRendererOptions): HtmlExtension => {
  let tableCounter = 0;

  const ext: HtmlExtension = {
    enter: {
      // Force all lists to be tight (replicate default handler logic after overriding _loose)
      listOrdered(this: CompileContext, token: Token) {
        token._loose = false;
        const tightStack = this.getData('tightStack') as boolean[];
        tightStack.push(true);
        this.lineEndingIfNeeded();
        this.tag('<ol');
        this.setData('expectFirstItem', true);
      },
      listUnordered(this: CompileContext, token: Token) {
        token._loose = false;
        const tightStack = this.getData('tightStack') as boolean[];
        tightStack.push(true);
        this.lineEndingIfNeeded();
        this.tag('<ul');
        this.setData('expectFirstItem', true);
      },

      // Track paragraph state so lineEnding only emits <br /> inside paragraphs
      paragraph(this: CompileContext) {
        const tightStack = this.getData('tightStack') as boolean[];
        if (!tightStack[tightStack.length - 1]) {
          this.lineEndingIfNeeded();
          this.tag('<p>');
        }
        this.setData('slurpAllLineEndings');
        this.setData('inParagraph', true);
      },

      // Tables: wrapper + classes
      table(this: CompileContext, token: Token) {
        const tableId = `table-${Math.random().toString(36).substring(2, 15)}`;
        this.setData('currentTableId', tableId);
        this.setData('currentTableIndex', tableCounter++);
        this.lineEndingIfNeeded();
        this.raw('<div class="table-wrapper"><div class="table-scroll-container">');
        this.tag(`<table class="table table-hover" id="${tableId}">`);
        this.setData(
          'tableAlign',
          (token as unknown as Record<string, unknown>)._align as undefined
        );
      }
    },
    exit: {
      // Headings: h1→h2+strong, h6→strong
      atxHeadingSequence(this: CompileContext, token: Token) {
        if (this.getData('headingRank')) {
          return;
        }
        const rank = this.sliceSerialize(token).length;
        this.setData('headingRank', rank);
        this.lineEndingIfNeeded();
        if (rank === 1) {
          this.tag('<h2><strong>');
        } else if (rank === 6) {
          this.tag('<strong>');
        } else {
          this.tag(`<h${rank}>`);
        }
      },
      atxHeading(this: CompileContext) {
        const rank = this.getData('headingRank') as number;
        if (rank === 1) {
          this.tag('</strong></h2>');
        } else if (rank === 6) {
          this.tag('</strong>');
        } else {
          this.tag(`</h${rank}>`);
        }
        this.setData('headingRank');
      },

      // Tables: close wrappers, add download button
      table(this: CompileContext) {
        this.setData('tableAlign');
        this.setData('slurpAllLineEndings');
        this.lineEndingIfNeeded();
        this.tag('</table>');
        this.raw('</div>'); // close .table-scroll-container

        if (options?.downloadTableButton) {
          const translatedLabel = options.translateSync
            ? options.translateSync(options.downloadTableButton)
            : options.downloadTableButton;
          const buttonLabel = escapeHtml(translatedLabel);
          const tableId = this.getData('currentTableId') ?? '';
          const tableIndex = this.getData('currentTableIndex') ?? 0;
          this.raw(
            `<button type="button" class="btn btn-circle btn-sm btn-tertiary download-table-btn" data-table-id="${tableId}" data-table-index="${tableIndex}" aria-label="${buttonLabel}"><i class="icon element-download" aria-hidden="true"></i></button>`
          );
        }

        this.raw('</div>'); // close .table-wrapper
      },

      // Track paragraph exit + replicate default behavior
      paragraph(this: CompileContext) {
        this.setData('inParagraph');
        const tightStack = this.getData('tightStack') as boolean[];
        if (tightStack[tightStack.length - 1]) {
          this.setData('slurpAllLineEndings', true);
        } else {
          this.tag('</p>');
        }
      },

      // Soft line breaks → <br /> (only inside paragraphs)
      lineEnding(this: CompileContext, token: Token) {
        if (this.getData('slurpAllLineEndings')) {
          return;
        }
        if (this.getData('slurpOneLineEnding')) {
          this.setData('slurpOneLineEnding');
          return;
        }
        if (this.getData('inCodeText')) {
          this.raw(' ');
          return;
        }
        if (this.getData('inParagraph')) {
          this.tag('<br />');
        }
        this.raw(this.encode(this.sliceSerialize(token)));
      }
    }
  };

  return ext;
};

/**
 * DOM-based link customization: adds class, target, and rel attributes
 * to all anchor elements, and sanitizes URLs.
 */
const customizeLinks = (container: HTMLElement, sanitizer: DomSanitizer): void => {
  Array.from(container.querySelectorAll('a')).forEach(a => {
    const href = a.getAttribute('href') ?? '';
    const sanitized = sanitizeUrl(href, sanitizer);
    a.setAttribute('href', sanitized);
    a.classList.add('link-text');
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
};

/**
 * DOM-based display math wrapping: wraps .math.math-display elements
 * in a .latex-display-wrapper div for proper styling.
 */
const wrapDisplayMath = (container: HTMLElement, docRef: Document): void => {
  Array.from(container.querySelectorAll('.math.math-display')).forEach(el => {
    const wrapper = docRef.createElement('div');
    wrapper.className = 'latex-display-wrapper';
    el.parentNode?.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
};

/**
 * Dangerous HTML elements that should be completely removed from the DOM.
 */
const DANGEROUS_ELEMENTS = ['script', 'iframe', 'object', 'embed', 'form', 'meta', 'link', 'style'];

/**
 * Dangerous HTML attribute prefixes/patterns.
 */
const DANGEROUS_ATTR_PATTERN = /^on|^formaction$/i;

/**
 * DOM-based sanitization that removes dangerous elements and attributes.
 * This runs after innerHTML is set, so it catches both actual HTML elements
 * and entity-encoded HTML that the browser decoded.
 */
const sanitizeDom = (container: HTMLElement): void => {
  // Remove dangerous elements
  for (const tagName of DANGEROUS_ELEMENTS) {
    const elements = Array.from(container.querySelectorAll(tagName));
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
  }

  // Remove dangerous attributes from all remaining elements
  const allElements = Array.from(container.querySelectorAll('*'));
  for (const el of allElements) {
    const attrsToRemove: string[] = [];
    for (const attr of Array.from(el.attributes)) {
      if (DANGEROUS_ATTR_PATTERN.test(attr.name)) {
        attrsToRemove.push(attr.name);
      }
      if (attr.name === 'href' || attr.name === 'src' || attr.name === 'action') {
        if (/^\s*javascript:/i.test(attr.value)) {
          attrsToRemove.push(attr.name);
        }
      }
    }
    for (const name of attrsToRemove) {
      el.removeAttribute(name);
    }
  }
};

/**
 * Sanitize URL to prevent XSS attacks.
 */
const sanitizeUrl = (url: string, sanitizer: DomSanitizer): string => {
  url = url.trim();
  const allowed = /^(https?:\/\/|mailto:|\/(?!\/)|\.{1,2}\/|#)/i;
  if (!allowed.test(url)) {
    return '#';
  }
  return sanitizer.sanitize(SecurityContext.URL, url) ?? '#';
};

/**
 * Escape HTML special characters.
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Type alias for the markdown renderer function returned by {@link injectMarkdownRenderer}.
 *
 * @experimental
 */
export type MarkdownRenderer = (text: string) => Node;

/**
 * Creates a markdown renderer function within an Angular injection context.
 *
 * Must be called in an injection context (e.g. field initializer, constructor, or `runInInjectionContext`).
 *
 * @example
 * ```typescript
 * protected renderer = injectMarkdownRenderer({ syntaxHighlighter: myHighlighter });
 * ```
 *
 * @experimental
 * @param options - Optional configuration for the markdown renderer
 * @returns A function taking the markdown text to transform and returning a DOM node containing the formatted HTML
 */
export const injectMarkdownRenderer = (options?: MarkdownRendererOptions): MarkdownRenderer => {
  const sanitizer = inject(DomSanitizer);
  const doc = inject(DOCUMENT);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const translateService = injectSiTranslateService();

  const resolvedOptions: MarkdownRendererOptions = {
    copyCodeButton: t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY_CODE:Copy code`),
    downloadTableButton: t(() => $localize`:@@SI_MARKDOWN_RENDERER.DOWNLOAD:Download CSV`),
    translateSync: translateService.translateSync.bind(translateService),
    ...options
  };

  return createMarkdownRenderer(sanitizer, resolvedOptions, doc, isBrowser);
};

/**
 * Injection token for a markdown renderer function.
 *
 * Provide it via {@link provideMarkdownRenderer} and inject where needed
 * to pass as an input (e.g. `contentFormatter`) to components:
 *
 * @example
 * ```typescript
 * // in app config
 * providers: [provideMarkdownRenderer({ syntaxHighlighter: myHighlighter })]
 *
 * // in a component
 * protected markdownRenderer = inject(SI_MARKDOWN_RENDERER);
 * ```
 *
 * @experimental
 */
export const SI_MARKDOWN_RENDERER = new InjectionToken<MarkdownRenderer>('SI_MARKDOWN_RENDERER');

/**
 * Provider function to provide {@link SI_MARKDOWN_RENDERER} with custom options.
 *
 * @experimental
 * @param options - Configuration for the markdown renderer
 * @returns A provider for `SI_MARKDOWN_RENDERER`
 */
export const provideMarkdownRenderer = (options?: MarkdownRendererOptions): Provider => ({
  provide: SI_MARKDOWN_RENDERER,
  useFactory: () => injectMarkdownRenderer(options)
});
