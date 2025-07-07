/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { ElementRef, InjectionToken, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';

import { TourStep } from './si-tour.model';

export interface TourStepInternal {
  step: TourStep;
  stepNumber: number;
  totalSteps: number;
  anchor?: ElementRef<HTMLElement>;
}

export type TourAction = 'next' | 'back' | 'cancel' | 'complete';

export interface PositionChange {
  change: ConnectedOverlayPositionChange;
  anchor: ElementRef;
}
export interface TourToken {
  currentStep: Subject<TourStepInternal>;
  blocked: WritableSignal<boolean>;
  positionChange: Subject<PositionChange | undefined>;
  sizeChange: Subject<void>;
  control: Subject<TourAction>;
}

export const SI_TOUR_TOKEN = new InjectionToken<TourToken>('SI_TOUR_TOKEN');
