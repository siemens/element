/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ScrollStrategy
} from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { positions } from '@siemens/element-ng/overlay';

import { isRTL } from './rtl';

export function makePositionStrategy(
  elementRef: ElementRef<any> | undefined,
  overlay: Overlay,
  placement: keyof typeof positions | ConnectionPositionPair[],
  constrain = false,
  center = true
): PositionStrategy {
  if (!elementRef?.nativeElement) {
    return overlay.position().global().centerHorizontally().centerVertically();
  }

  const popoverPositions = getOverlayPositions(elementRef, placement, center);
  const positionStrategy = overlay
    .position()
    .flexibleConnectedTo(elementRef)
    .withPush(false)
    .withGrowAfterOpen(true)
    .withFlexibleDimensions(constrain)
    .withPositions(popoverPositions);
  if (constrain) {
    positionStrategy.withViewportMargin(8);
  }
  return positionStrategy;
}

export function makeOverlay(
  positionStrategy: PositionStrategy,
  overlay: Overlay,
  hasBackdrop: boolean,
  scrollStrategy?: ScrollStrategy
): OverlayRef {
  const config = new OverlayConfig();
  config.positionStrategy = positionStrategy;
  config.scrollStrategy = scrollStrategy ?? overlay.scrollStrategies.reposition();
  config.direction = isRTL() ? 'rtl' : 'ltr';
  if (hasBackdrop) {
    config.hasBackdrop = true;
    config.backdropClass = 'cdk-overlay-transparent-backdrop';
  } else {
    config.hasBackdrop = false;
  }
  return overlay.create(config);
}

export function getOverlay(
  elementRef: ElementRef<any>,
  overlay: Overlay,
  hasBackdrop: boolean,
  placement: keyof typeof positions | ConnectionPositionPair[],
  constrain = false,
  center = true,
  scrollStrategy?: ScrollStrategy
): OverlayRef {
  const positionStrategy = makePositionStrategy(elementRef, overlay, placement, constrain, center);
  return makeOverlay(positionStrategy, overlay, hasBackdrop, scrollStrategy);
}

export function getPositionStrategy(
  overlayref: OverlayRef
): FlexibleConnectedPositionStrategy | undefined {
  return overlayref.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
}

export function getOverlayPositions(
  elementRef: ElementRef<any>,
  placement: keyof typeof positions | ConnectionPositionPair[],
  center = true
): ConnectionPositionPair[] {
  void elementRef;
  void center;
  return typeof placement === 'string' ? positions[placement] : placement;
}

export function hasTrigger(trigger: string, triggers?: string): boolean {
  return (triggers?.split(/\s+/) ?? []).includes(trigger);
}
