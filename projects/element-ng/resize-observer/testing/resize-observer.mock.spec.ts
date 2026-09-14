/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  mockResizeObserver,
  MockResizeObserver,
  restoreResizeObserver
} from './resize-observer.mock';

describe('mockResizeObserver', () => {
  afterEach(() => restoreResizeObserver());

  it('clears instances recorded before installation', () => {
    new MockResizeObserver(vi.fn());
    expect(MockResizeObserver.instances.length).toBeGreaterThan(0);

    mockResizeObserver();

    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it('replaces an existing observation for the same target', () => {
    const observer = new MockResizeObserver(vi.fn());
    const target = document.createElement('div');

    observer.observe(target, { box: 'content-box' });
    observer.observe(target, { box: 'border-box' });

    expect(observer.observed).toEqual([[target, { box: 'border-box' }]]);
  });
});
