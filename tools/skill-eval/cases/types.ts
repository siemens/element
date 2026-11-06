/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Page } from '@playwright/test';

export interface EvaluationCase {
  id: string;
  prompt: string;
  route: string;
  verifyPage: (page: Page) => Promise<void>;
}
