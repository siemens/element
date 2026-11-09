/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect } from '@playwright/test';

import { type EvaluationCase } from './types';

export const registeredIcon: EvaluationCase = {
  id: 'registered-icon',
  route: '/actions',
  prompt:
    'Add a page at /actions to this Siemens Element application with an icon-only button whose accessible name is "Refresh devices". Use the appropriate refresh icon from the installed Element icon package and the documented icon registration mechanism. Clicking the button should display "Devices refreshed" in a status message. Keep the existing application shell and pages.',
  verifyPage: async page => {
    const refresh = page.getByRole('button', { name: 'Refresh devices', exact: true });
    await expect(
      refresh.locator('si-icon[data-icon="elementRefresh"] .svg-element-icon'),
      'Registered Element refresh icon in the "Refresh devices" button'
    ).toBeVisible();
    await refresh.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('status'),
      'Devices refreshed status message after keyboard activation'
    ).toContainText('Devices refreshed');
  }
};
