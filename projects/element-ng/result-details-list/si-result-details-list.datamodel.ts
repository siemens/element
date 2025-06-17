/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export interface ResultDetailStep {
  /**
   * A description of the step.
   */
  description: string;
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
  detail?: string;
  /**
   * Optional translation params to be used with translate pipe.
   */
  translationParams?: Record<string, unknown>;
}

/**
 * @deprecated This will be removed in a future release. Use the string values directly.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResultDetailStepState = {
  Passed: 'passed',
  Failed: 'failed',
  Running: 'running',
  NotSupported: 'not-supported',
  NotStarted: 'not-started'
} as const;

/**
 * This type defines the state that a detailed result step can have.
 */
export type ResultDetailStepState =
  (typeof ResultDetailStepState)[keyof typeof ResultDetailStepState];
