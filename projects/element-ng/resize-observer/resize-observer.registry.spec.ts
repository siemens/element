/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { ResizeObserverRegistry } from './resize-observer.registry';
import {
  mockResizeObserver,
  MockResizeObserver,
  restoreResizeObserver
} from './testing/resize-observer.mock';

describe('ResizeObserverRegistry', () => {
  beforeEach(() => mockResizeObserver());

  afterEach(() => restoreResizeObserver());

  it('disconnects its native observer when the injector is destroyed', () => {
    const registry = TestBed.inject(ResizeObserverRegistry);
    const target = document.createElement('div');
    registry.observe(target, 'content-box', vi.fn());
    const observer = MockResizeObserver.instances[0];

    expect(observer.observed).toHaveLength(1);

    TestBed.resetTestingModule();

    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(observer.observed).toHaveLength(0);
  });
});
