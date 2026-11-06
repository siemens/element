/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { formValidation } from './form-validation';
import { pageHeader } from './page-header';
import { registeredIcon } from './registered-icon';
import { type EvaluationCase } from './types';

export const cases: EvaluationCase[] = [pageHeader, formValidation, registeredIcon];

export const taskInstructions =
  '\n\nWork in the provided project. Do not modify dependencies, configuration, tests, or agent instructions. Shell commands are unavailable; an independent verifier will run lint, formatting checks, build, unit tests, and browser checks after your response.';
