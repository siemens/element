/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** */
export interface ResultDetailStep {
  /**
   * A description of the step.
   */
  description: TranslatableString;
  /**
   * A state object defining the state of the step.
   */
  state: ResultDetailStepState;
  /**
   * Optional value to be displayed for the step.
   */
  value?: string;
  /**
   * Optional error message to display.
   */
  errorMessage?: string;
  /**
   * Optional custom icon to display. Otherwise a default icon will be shown based on the state property.
   */
  icon?: string;
  /**
   * Optional detail text which appears below description.
   */
  detail?: TranslatableString;
  /**
   * Optional translation params to be used with translate pipe.
   */
  translationParams?: Record<string, unknown>;
}

/**
 * This type defines the state that a detailed result step can have.
 */
export type ResultDetailStepState =
  | 'passed'
  | 'failed'
  | 'running'
  | 'not-supported'
  | 'not-started';
