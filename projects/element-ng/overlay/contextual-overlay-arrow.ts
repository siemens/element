/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';

export interface OverlayArrowPosition {
  left?: number;
  right?: number;
}

/** Calculates the arrow position for a contextual overlay. */
export function calculateOverlayArrowPosition(
  change: ConnectedOverlayPositionChange,
  overlay: ElementRef,
  anchor?: ElementRef
): OverlayArrowPosition {
  if (anchor && ['bottom', 'top'].includes(change.connectionPair.originY)) {
    const anchorRect = anchor.nativeElement.getBoundingClientRect();
    const overlayRect = overlay.nativeElement.getBoundingClientRect();
    const center = anchorRect.left + anchorRect.width / 2;

    // prettier-ignore
    return getComputedStyle(document.documentElement).direction === 'rtl'
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
