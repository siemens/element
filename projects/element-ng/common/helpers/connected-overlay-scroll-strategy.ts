/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  CDK_CONNECTED_OVERLAY_DEFAULT_CONFIG,
  ScrollStrategy,
  ScrollStrategyOptions
} from '@angular/cdk/overlay';
import { inject } from '@angular/core';

/**
 * Returns the configured connected-overlay scroll strategy or the CDK reposition fallback.
 * Must be called in an Angular injection context.
 */
export function defaultConnectedOverlayScrollStrategy(): ScrollStrategy {
  return defaultConnectedOverlayScrollStrategyFactory()();
}

/**
 * Returns a factory that creates a connected-overlay scroll strategy on demand.
 * Must be called in an Angular injection context.
 */
export function defaultConnectedOverlayScrollStrategyFactory(): () => ScrollStrategy {
  const defaultScrollStrategy = inject(CDK_CONNECTED_OVERLAY_DEFAULT_CONFIG, {
    optional: true
  })?.scrollStrategy;
  const scrollStrategyOptions = inject(ScrollStrategyOptions);
  return () => defaultScrollStrategy ?? scrollStrategyOptions.reposition();
}
