/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Gets a cached HTML element or creates a new one if not in cache.
 * Implements LRU caching strategy.
 */
export const getCachedOrCreateElement = (
  cache: Map<string, HTMLElement>,
  cacheOrder: string[],
  cacheSize: number,
  key: string,
  createHtml: () => string,
  doc: Document
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

  const tempDiv = doc.createElement('div');
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
