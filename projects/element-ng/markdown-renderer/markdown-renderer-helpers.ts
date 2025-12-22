/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Sanitizes HTML while preserving inline style attributes.
 * Uses class-based placeholders to preserve styles through sanitization.
 * This prevents style attributes from being stripped while maintaining security.
 */
export const sanitizeHtmlWithStyles = (html: string, sanitizer: DomSanitizer): string | null => {
  const styleMap = new Map<string, string>();
  let counter = 0;
  const styleId = `STYLE-PH-${Math.random().toString(36).substring(2, 15)}`;

  // Step 1: Extract all style attributes and replace with placeholder classes
  let processed = html;

  // Match any element with a style attribute
  processed = processed.replace(
    /(<[a-z][a-z0-9]*[^>]*?)\s+style="([^"]*)"/gi,
    (match, tagStart, styleContent) => {
      const placeholder = `${styleId}-${counter++}`;
      styleMap.set(placeholder, styleContent);

      // Check if tag already has a class attribute
      const hasClass = /\sclass="[^"]*"/.test(tagStart);

      if (hasClass) {
        // Add placeholder to existing class attribute
        return tagStart.replace(/(\sclass=")([^"]*)"/i, `$1$2 ${placeholder}"`);
      } else {
        // Add new class attribute with placeholder
        return `${tagStart} class="${placeholder}"`;
      }
    }
  );

  // Step 2: Remove any remaining style attributes (safety measure)
  processed = processed.replace(/\s+style="[^"]*"/gi, '');

  // Step 3: Sanitize the HTML structure (now without style attributes)
  const sanitized = sanitizer.sanitize(SecurityContext.HTML, processed);
  if (!sanitized) {
    return null;
  }

  // Step 4: Restore style attributes from placeholders
  let restored = sanitized;
  styleMap.forEach((styleContent, placeholder) => {
    // Sanitize individual style content
    const sanitizedStyle = sanitizer.sanitize(SecurityContext.STYLE, styleContent);
    if (sanitizedStyle) {
      // Escape the sanitized style to prevent injection
      const escapedStyle = sanitizedStyle
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Find and replace the placeholder in class attributes
      restored = restored.replace(new RegExp(`class="([^"]*)"`, 'g'), (match, classContent) => {
        if (classContent.includes(placeholder)) {
          // Remove the placeholder from class list
          const remainingClasses = classContent
            .split(/\s+/)
            .filter((cls: string) => cls && cls !== placeholder)
            .join(' ')
            .trim();

          // Add style attribute and keep remaining classes if any
          if (remainingClasses) {
            return `class="${remainingClasses}" style="${escapedStyle}"`;
          }
          return `style="${escapedStyle}"`;
        }
        return match;
      });
    }
  });

  return restored;
};

/**
 * Gets a cached HTML element or creates a new one if not in cache.
 * Implements LRU caching strategy.
 */
export const getCachedOrCreateElement = (
  cache: Map<string, HTMLElement>,
  cacheOrder: string[],
  cacheSize: number,
  key: string,
  createHtml: () => string
): HTMLElement => {
  const cached = cache.get(key);
  if (cached) {
    const orderIndex = cacheOrder.indexOf(key);
    if (orderIndex > -1) {
      cacheOrder.splice(orderIndex, 1);
    }
    cacheOrder.push(key);
    return cached;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = createHtml();
  const element = tempDiv.firstElementChild as HTMLElement;

  cache.set(key, element);
  cacheOrder.push(key);

  if (cacheOrder.length > cacheSize) {
    const oldestKey = cacheOrder.shift();
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  return element;
};

/**
 * Gets a cached string or creates a new one if not in cache.
 * Implements LRU caching strategy.
 */
export const getCachedOrCreateString = (
  cache: Map<string, string>,
  cacheOrder: string[],
  cacheSize: number,
  key: string,
  createString: () => string
): string => {
  const cached = cache.get(key);
  if (cached) {
    const orderIndex = cacheOrder.indexOf(key);
    if (orderIndex > -1) {
      cacheOrder.splice(orderIndex, 1);
    }
    cacheOrder.push(key);
    return cached;
  }

  const result = createString();

  cache.set(key, result);
  cacheOrder.push(key);

  if (cacheOrder.length > cacheSize) {
    const oldestKey = cacheOrder.shift();
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  return result;
};
