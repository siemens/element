/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  ConnectedOverlayPositionChange,
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy
} from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';

import {
  positionBottomEnd,
  positionBottomStart,
  positions,
  positionTopEnd,
  positionTopStart
} from '../models/positions.model';
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
  hasBackdrop: boolean
): OverlayRef {
  const config = new OverlayConfig();
  config.positionStrategy = positionStrategy;
  config.scrollStrategy = overlay.scrollStrategies.reposition();
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
  center = true
): OverlayRef {
  const positionStrategy = makePositionStrategy(elementRef, overlay, placement, constrain, center);
  return makeOverlay(positionStrategy, overlay, hasBackdrop);
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
  if (elementRef.nativeElement && center) {
    const rtl = isRTL();
    const halfWidth = Math.round(elementRef.nativeElement.offsetWidth / 2);
    positionTopStart.offsetX = positionBottomStart.offsetX = halfWidth * (rtl ? 1 : -1);
    positionTopEnd.offsetX = positionBottomEnd.offsetX = halfWidth * (rtl ? -1 : 1);
  } else {
    positionTopStart.offsetX = undefined;
    positionTopEnd.offsetX = undefined;
    positionBottomStart.offsetX = undefined;
    positionBottomEnd.offsetX = undefined;
  }
  return typeof placement === 'string' ? positions[placement] : placement;
}

export function hasTrigger(trigger: string, triggers?: string): boolean {
  return (triggers?.split(/\s+/) ?? []).includes(trigger);
}

export interface OverlayArrowPosition {
  left?: number;
  right?: number;
}
/**
 * calculates the arrow position from left/right for tooltips, popovers, etc
 * @param change - the event from the position strategy
 * @param overlay - ElementRef for the overlay content, i.e. the popover/tooltip component
 * @param anchor - ElementRef for the anchoring element, i.e. the trigger of the popover/tooltip
 */
export function calculateOverlayArrowPosition(
  change: ConnectedOverlayPositionChange,
  overlay: ElementRef,
  anchor?: ElementRef
): OverlayArrowPosition {
  if (anchor && ['bottom', 'top'].includes(change.connectionPair.originY)) {
    // Calculate offset to the anchor element center
    const anchorRect = anchor.nativeElement.getBoundingClientRect();
    const overlayRect = overlay.nativeElement.getBoundingClientRect();
    const center = anchorRect.left + anchorRect.width / 2;
    // Position arrow centered to the anchor element

    // prettier-ignore
    return isRTL()
      ? { right: overlayRect.right - center }
      : { left: center - overlayRect.left };
  }

  const offsetX = change.connectionPair.offsetX;
  if (offsetX) {
    // prettier-ignore
    return offsetX < 0
      ? { left: -offsetX }
      : { right: offsetX };
  }
  return {};
}
