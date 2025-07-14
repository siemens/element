/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectionPositionPair } from '@angular/cdk/overlay';

const positionStart: ConnectionPositionPair = {
  overlayX: 'end',
  overlayY: 'center',
  originX: 'start',
  originY: 'center'
};

const positionEnd: ConnectionPositionPair = {
  overlayX: 'start',
  overlayY: 'center',
  originX: 'end',
  originY: 'center'
};

export const positionTopCenter: ConnectionPositionPair = {
  overlayX: 'center',
  overlayY: 'bottom',
  originX: 'center',
  originY: 'top'
};

export const positionTopStart: ConnectionPositionPair = {
  overlayX: 'start',
  overlayY: 'bottom',
  originX: 'center',
  originY: 'top'
};

export const positionTopEnd: ConnectionPositionPair = {
  overlayX: 'end',
  overlayY: 'bottom',
  originX: 'center',
  originY: 'top'
};

export const positionBottomCenter: ConnectionPositionPair = {
  overlayX: 'center',
  overlayY: 'top',
  originX: 'center',
  originY: 'bottom'
};

export const positionBottomStart: ConnectionPositionPair = {
  overlayX: 'start',
  overlayY: 'top',
  originX: 'center',
  originY: 'bottom'
};

export const positionBottomEnd: ConnectionPositionPair = {
  overlayX: 'end',
  overlayY: 'top',
  originX: 'center',
  originY: 'bottom'
};

export const positions = {
  top: [
    positionTopCenter,
    positionTopStart,
    positionTopEnd,
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionStart,
    positionEnd
  ],
  end: [
    positionEnd,
    positionTopCenter,
    positionTopStart,
    positionTopEnd,
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionStart
  ],
  bottom: [
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionTopCenter,
    positionTopStart,
    positionTopEnd,
    positionStart,
    positionEnd
  ],
  start: [
    positionStart,
    positionTopCenter,
    positionTopStart,
    positionTopEnd,
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionEnd
  ],
  auto: [
    positionTopCenter,
    positionTopStart,
    positionTopEnd,
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionStart,
    positionEnd
  ]
};
